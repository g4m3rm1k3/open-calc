# Lesson 20 — Sessions, Cookies, and Persistence

## What You Will Build

Make auth persistent. The user stays logged in after closing the browser tab. Implement
a "remember me" option. Inspect the cookies in browser DevTools and see exactly what is
stored. Understand the security implications of every storage choice.

---

## What You Need to Know First

- Lesson 17: JWT tokens, auth flow
- Lesson 19: OAuth, the callback flow

---

## The Lesson

### Step 1 — Cookies

A **cookie** is a small piece of data (up to 4KB) that the browser stores and automatically
sends with every request to the originating domain.

**How cookies are set:**
```
HTTP Response:
Set-Cookie: authToken=eyJ...; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/
```

The `Set-Cookie` header instructs the browser to store the value. The browser then sends
this cookie with every subsequent request to the same domain:
```
HTTP Request:
Cookie: authToken=eyJ...
```

No JavaScript needed — the browser does this automatically. This is why cookies are the
default mechanism for session management: the authentication header is sent automatically,
without the application explicitly including it.

**Cookie attributes — each one explained:**

**`HttpOnly`:** The browser cannot read or modify this cookie with JavaScript
(`document.cookie` does not include it). This prevents XSS attacks from stealing the
cookie: even if an attacker injects a script into your page, the script cannot read
`HttpOnly` cookies.

**`Secure`:** The browser only sends this cookie over HTTPS connections. Over HTTP,
the cookie is not transmitted. This prevents network-level interception (if a user is
on an HTTP site, an attacker on the same network can read the cookies — but not `Secure` ones).
In development with `localhost`, the `Secure` flag can be omitted.

**`SameSite`:** Controls when the browser sends the cookie on cross-site requests:
- `Strict` — only sent when navigating from the same site. A link from `evil.com`
  to `yourapp.com` does not send the cookie. User appears logged out when clicked from
  external links.
- `Lax` — sent for top-level navigations (clicking a link) but not for embedded requests
  (images, iframes, `fetch` from other sites). This is the default and the right choice
  for most apps.
- `None` — sent on all requests including cross-site. Requires `Secure`. Used for
  embedded widgets and third-party iframes.

**`Max-Age`:** How long the cookie lasts in seconds. `Max-Age=86400` is 24 hours.
Without `Max-Age` or `Expires`, the cookie is a **session cookie** — deleted when the
browser is closed. `Max-Age=0` deletes the cookie immediately.

### Step 2 — The CSRF Attack

**CSRF (Cross-Site Request Forgery):** An attacker's page tricks the user's browser into
making a request to your API using the user's cookies.

**The attack:**
1. User is logged into `yourapp.com`. Browser has an `authToken` cookie.
2. User visits `evil.com`.
3. `evil.com`'s JavaScript sends: `fetch('https://yourapp.com/api/progress/complete', { method: 'POST' })`
4. The browser automatically sends the `authToken` cookie with the request.
5. Your server receives a valid authenticated request — from the user's session, but
   initiated by the attacker.

With cookies, the browser sends authentication automatically — but also sends it for
requests initiated by other sites.

**How `SameSite=Lax` prevents it:**
`SameSite=Lax` means cookies are not sent for cross-origin `fetch` or `XmlHttpRequest`
calls. `evil.com`'s `fetch('/api/progress/complete')` does not include the cookie.
The request arrives unauthenticated. The attack fails.

**How a CSRF token provides additional protection:**
A CSRF token is a random value stored in the session and sent with every HTML form or
API request as a header (`X-CSRF-Token`). The server verifies the header value matches
the session value. Since `evil.com` cannot read your app's CSRF token (same-origin policy),
it cannot forge a valid request. This is defence in depth — a second layer alongside
`SameSite`.

### Step 3 — Session Fixation

**Session fixation:** An attacker sets a known session ID in the user's browser (via a
URL trick or a cookie), waits for the user to log in, and then uses that session ID —
which is now associated with a valid authenticated session.

**Prevention:** Always generate a **new session ID on login.** The old session ID (which
the attacker may know) is invalidated. After login, only the user knows the new session ID.

In a JWT-based system, this means issuing a new token on login and discarding the old one.
In a session-based system, this means calling `req.session.regenerate()` on login.

### Step 4 — Token Storage Tradeoffs

Three options for storing auth tokens in a web app, with their actual security tradeoffs:

**Option A: `localStorage`**
- ✅ Simple to implement
- ✅ Survives page reloads
- ❌ Readable by JavaScript — vulnerable to XSS (a script injected via XSS can read it)
- ❌ Not sent automatically — must be manually added to every request

**Option B: `HttpOnly` cookie**
- ✅ Not readable by JavaScript — XSS cannot steal the token
- ✅ Sent automatically by the browser
- ❌ Requires CSRF protection (`SameSite=Lax` and/or CSRF tokens)
- ✅ `Secure` flag ensures HTTPS-only

**Option C: In-memory variable (JavaScript variable)**
- ✅ Not accessible to XSS beyond the current page (not persisted)
- ❌ Lost on page reload
- ✅ Use with a refresh token in an `HttpOnly` cookie to re-issue on reload

**For web apps:** `HttpOnly` cookies with `SameSite=Lax` and `Secure` is the most
secure option. The XSS risk of `localStorage` is significant — one `innerHTML` without
sanitisation, one vulnerable third-party script, or one malicious npm package, and every
user's token is stolen.

**For mobile apps:** `AsyncStorage` (Lesson 17) is acceptable — the OS app sandbox
prevents other apps from reading it. XSS is not a concern in native apps.

### Step 5 — Implementing HttpOnly Cookie Auth

Update the auth routes to use cookies instead of returning tokens in the body:

```typescript
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body)

    const user = await findAndVerifyUser(email, password)
    if (user === null) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user.id)

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    })

    res.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    next(error)
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('authToken')
  res.json({ success: true })
})
```

**Update the `authenticate` middleware to read from cookies:**
```typescript
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  // Try Authorization header first, then cookie
  const headerToken = req.headers['authorization']?.slice('Bearer '.length)
  const cookieToken = req.cookies['authToken']
  const token = headerToken ?? cookieToken

  if (token === undefined) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // ... rest of verification unchanged
}
```

**`cookie-parser` middleware:**
```bash
$ npm install cookie-parser
$ npm install --save-dev @types/cookie-parser
```
```typescript
import cookieParser from 'cookie-parser'
app.use(cookieParser())  // makes req.cookies available
```

### Step 6 — "Remember Me" and Refresh Tokens

**The problem:** Access tokens expire (Lesson 17 uses `expiresIn: '1h'`). After one hour,
the user is logged out. "Remember me" requires a long-lived token.

**Refresh tokens:** A **refresh token** is a long-lived, single-use token stored in an
`HttpOnly` cookie. When the access token expires, the client sends the refresh token to
a `/api/auth/refresh` endpoint. The server verifies the refresh token, issues a new
access token, and rotates the refresh token (issues a new one, invalidates the old one).

```typescript
router.post('/refresh', async (req, res, next) => {
  const refreshToken = req.cookies['refreshToken']
  if (refreshToken === undefined) {
    return res.status(401).json({ error: 'No refresh token' })
  }

  const session = await prisma.session.findUnique({ where: { token: refreshToken } })
  if (session === null || session.expiresAt < new Date()) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' })
  }

  // Rotate: delete old, issue new
  await prisma.session.delete({ where: { id: session.id } })
  const newRefreshToken = generateSecureRandomString(64)
  await prisma.session.create({
    data: {
      userId: session.userId,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),  // 30 days
    },
  })

  res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'lax' })
  const newAccessToken = generateToken(session.userId)
  res.cookie('authToken', newAccessToken, { httpOnly: true, ... })
  res.json({ success: true })
})
```

**Refresh token rotation** ensures that even if a refresh token is stolen, it can only
be used once. After the attacker uses it, the legitimate user's next refresh will find
the token invalidated — and the user's session is terminated.

---

## Connect the Pieces

The `SameSite=Lax` cookie attribute is the browser's implementation of the CSRF defence
discussed in Lesson 19's `state` parameter: both prevent cross-site requests from
appearing as legitimate. They operate at different levels (cookie transmission vs OAuth
state verification).

The refresh token rotation pattern — invalidate on use, issue a new one — is the same
as the one-time OAuth authorization code: each code is exchanged exactly once, then
discarded. The pattern prevents replay attacks.

In Lesson 31 (deployment), the `Secure` flag will be required on all cookies because
production traffic uses HTTPS. The CORS configuration will be tightened to the production
domain. The development setup (no `Secure` flag on localhost, CORS from all origins) is
not the production setup — understanding the gap is required.

---

## What Breaks Without This

Without `SameSite=Lax` on the auth cookie, an attacker can embed `<img src="https://yourapp.com/api/progress/complete">` on `evil.com`. When a logged-in user visits `evil.com`, the browser sends the GET request with the auth cookie. If the endpoint accepted GET for state changes, the lesson would be marked complete. With `SameSite=Lax`, state-changing cookies are not sent for cross-origin embedded requests.

Without `HttpOnly`, the XSS from any npm package you use (supply chain attack) can exfiltrate every logged-in user's token. In 2018, the `event-stream` npm package was compromised to steal Bitcoin wallets from a specific app. With `HttpOnly` cookies, the token is not accessible to scripts at all — even a compromised dependency cannot steal it.

---

## Definition of Done

- [ ] Login sets an `HttpOnly; Secure; SameSite=Lax` cookie
- [ ] The user stays logged in after closing and reopening the browser tab
- [ ] Logout clears the cookie
- [ ] Inspecting cookies in DevTools shows `authToken` with `HttpOnly` checked
- [ ] Sending `document.cookie` in the browser console does not show `authToken`
- [ ] A CSRF test request from `curl --cookie authToken=... evil.com/attack` is rejected by `SameSite=Lax`
- [ ] You can answer: what does each cookie attribute (`HttpOnly`, `Secure`, `SameSite`) do?
- [ ] You can answer: what is CSRF and how does `SameSite=Lax` prevent it?
- [ ] You can answer: what is session fixation and how is it prevented?
- [ ] You can answer: why are `HttpOnly` cookies safer than `localStorage` for token storage?
- [ ] `git commit` with a message explaining why — "Switch auth to HttpOnly cookies, add refresh token rotation"
