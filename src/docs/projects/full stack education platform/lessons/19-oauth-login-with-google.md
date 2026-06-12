# Lesson 19 — OAuth and "Login with Google"

## What You Will Build

Add Google OAuth login. The user clicks "Continue with Google," authenticates with Google,
and is logged into your app with their Google profile picture and name — no password
required. By the end, users can sign in with Google on web and mobile.

---

## What You Need to Know First

- Lesson 17: JWT tokens, authentication flow, the `users` table
- Lesson 11: Express routes, CORS

---

## The Lesson

### Step 1 — What OAuth 2.0 Is

**OAuth 2.0** is a framework for granting third-party applications access to a user's
data on another service, without sharing the user's credentials.

OAuth is an **authorization** framework, not an authentication protocol — though it is
widely used for authentication (logging in) via a standard called OpenID Connect (OIDC)
built on top of OAuth 2.0.

**The four roles:**
1. **Resource owner** — the user (Alice), who owns the data
2. **Client** — your app, which wants access
3. **Authorization server** — Google, which issues tokens after user consent
4. **Resource server** — Google's API, which the tokens grant access to

**Why use OAuth instead of "login with email"?**
- Users do not create another password (no password fatigue, no reuse risk)
- Google handles authentication (password hashing, MFA, phishing protection)
- You get a verified email address without sending a confirmation email
- Your app does not store passwords at all

**Why not implement OAuth yourself?**
The OAuth flow has subtle security requirements: state parameter (CSRF prevention), PKCE
(code interception prevention), token validation, redirect URI verification. A bespoke
implementation will have vulnerabilities. A library that has been reviewed by security
professionals and deployed at scale is the correct choice.

### Step 2 — The OAuth 2.0 Flow

The flow for "Login with Google" (step by step):

```
1. User clicks "Continue with Google"
2. Your app redirects the browser to Google:
   https://accounts.google.com/o/oauth2/auth?
     client_id=YOUR_CLIENT_ID&
     redirect_uri=https://yourapp.com/api/auth/callback/google&
     response_type=code&
     scope=openid email profile&
     state=RANDOM_STATE_VALUE

3. User sees Google's login page and grants permission

4. Google redirects back to your app:
   https://yourapp.com/api/auth/callback/google?
     code=AUTH_CODE&
     state=RANDOM_STATE_VALUE

5. Your server verifies state matches (CSRF check)
   Your server exchanges the code for tokens:
   POST https://oauth2.googleapis.com/token
   { client_id, client_secret, code, redirect_uri, grant_type: 'authorization_code' }

6. Google responds with:
   { access_token, id_token, refresh_token }

7. Your server decodes the id_token (a JWT from Google):
   { sub: "google-user-id", email: "alice@gmail.com", name: "Alice", picture: "https://..." }

8. Your server finds or creates the user in your database
   Your server issues your own JWT

9. User is logged in
```

**The `state` parameter — CSRF protection:**
Your app generates a random value before redirecting to Google, stores it in a cookie or
session, and includes it in the redirect URL as `state`. After Google redirects back,
your app verifies the returned `state` matches the stored value. Without this check,
an attacker could forge a callback request to your `/callback` endpoint, tricking the
server into logging in as a different user.

**The code exchange — why not return the token directly:**
Google returns a `code` (short-lived, single-use) to the browser. Your **server** exchanges
this code for tokens in a server-to-server request. The tokens never travel through the
browser — they are not in URLs or browser history. If Google returned the token to the
browser directly, it could be stolen from browser history or referrer headers.

**PKCE (Proof Key for Code Exchange):**
Mobile apps cannot safely store a client secret — the secret would be embedded in the
app binary and extractable. PKCE replaces the client secret with a challenge/verifier pair
generated per-flow. The app generates a random `code_verifier`, sends a `code_challenge`
(a hash of it) with the initial redirect, and proves possession of the original verifier
during the code exchange. This prevents authorization code interception attacks.

### Step 3 — Setting Up Google OAuth

**In Google Cloud Console:**
1. Go to `console.cloud.google.com`
2. Create a project
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret

Store in `.env`:
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

The client secret must never be in source code or the client bundle. It is a server-side
secret — only your server communicates directly with Google's token endpoint.

### Step 4 — The OAuth Handler

Install the Google OAuth library:
```bash
$ npm install google-auth-library
```

`google-auth-library` is Google's official Node.js OAuth client. It handles the
token exchange and `id_token` verification. Using the official library means Google's
security team maintains the implementation.

Create `server/src/routes/googleAuth.ts`:

```typescript
import { Router } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { prisma } from '../db'
import { generateToken } from '../auth/tokens'

const router = Router()
const oauthClient = new OAuth2Client(
  process.env['GOOGLE_CLIENT_ID'],
  process.env['GOOGLE_CLIENT_SECRET'],
  `${process.env['API_URL']}/api/auth/callback/google`
)

// Step 1: Generate the Google OAuth URL and redirect
router.get('/google', (req, res) => {
  const state = generateSecureRandomString(32)

  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,  // 10 minutes
  })

  const authUrl = oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state,
  })

  res.redirect(authUrl)
})

// Step 2: Handle the callback from Google
router.get('/callback/google', async (req, res, next) => {
  try {
    const { code, state } = req.query

    // Verify state to prevent CSRF
    const storedState = req.cookies['oauth_state']
    if (typeof state !== 'string' || state !== storedState) {
      return res.status(400).json({ error: 'Invalid OAuth state' })
    }
    res.clearCookie('oauth_state')

    if (typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' })
    }

    // Exchange code for tokens
    const { tokens } = await oauthClient.getToken(code)
    oauthClient.setCredentials(tokens)

    // Verify and decode the id_token
    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env['GOOGLE_CLIENT_ID'],
    })

    const payload = ticket.getPayload()!
    const { sub: googleId, email, name, picture } = payload

    if (email === undefined) {
      return res.status(400).json({ error: 'No email in Google profile' })
    }

    // Find or create the user
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: name ?? email,
        googleId,
        avatarUrl: picture,
        passwordHash: null,
      },
      update: {
        googleId,
        avatarUrl: picture,
        name: name ?? email,
      },
      select: { id: true, email: true, name: true, avatarUrl: true },
    })

    const appToken = generateToken(user.id)

    // Redirect to the app with the token
    const redirectUrl = `${process.env['APP_URL']}/auth/callback?token=${appToken}`
    res.redirect(redirectUrl)
  } catch (error) {
    next(error)
  }
})

function generateSecureRandomString(length: number): string {
  return require('crypto').randomBytes(length).toString('hex')
}

export { router as googleAuthRouter }
```

**`oauthClient.verifyIdToken` explained:**
The `id_token` from Google is a JWT. `verifyIdToken` checks the signature against Google's
public keys (fetched from Google's JWKS endpoint), verifies the `aud` (audience) matches
your client ID, and verifies the `exp`. Without this verification, an attacker could
forge an `id_token` with any email address.

**`prisma.user.upsert`:**
The user may already exist (they signed in with Google before) or may be new. `upsert`
handles both cases: if a user with this email exists, update their Google ID and avatar.
If not, create a new user. This is the same `upsert` pattern from Lesson 13.

**The redirect URI validation:** Google only redirects to URIs you registered in advance
in the Cloud Console. If an attacker changes the `redirect_uri` parameter in the initial
request, Google rejects it. You cannot redirect to an attacker-controlled URL to steal
the authorization code.

**Storing OAuth tokens — `HttpOnly` cookie for the state:**
The state cookie is set with `httpOnly: true` (JavaScript cannot read it), `sameSite: 'lax'`
(not sent on cross-site requests by default), and `secure: true` in production (HTTPS only).
Lesson 20 covers cookie security attributes in full detail.

---

## Connect the Pieces

The OAuth flow uses the same JWT verification pattern introduced in Lesson 17 — the
`id_token` from Google is a JWT with a signature and claims. The difference: you verify
it against Google's public keys (from their JWKS endpoint), not against your own secret.

The `upsert` call connects to Lesson 13: the database must handle both "first login" and
"subsequent login" cleanly. Without `upsert`, you would need a SELECT then INSERT or UPDATE
— two round trips with a potential race condition.

Auth.js (the library used in the full-stack curriculum): Auth.js wraps this exact OAuth
flow — the redirect, code exchange, user creation/lookup, and session creation — in a
configuration-driven library. Understanding the flow at this level means you understand
what Auth.js does and can debug it when it fails, rather than treating it as a black box.

---

## What Breaks Without This

Without the `state` parameter check, an attacker can craft a URL that, when visited by
an authenticated user, logs them into the attacker's account — linking the victim's
session to the attacker's Google account. This is a cross-site request forgery attack
on the OAuth flow specifically.

Without `verifyIdToken`, any token claiming to be from Google would be accepted. An
attacker could forge an `id_token` with `email: admin@yourcompany.com` and log in as
the admin. The verification step is not optional.

---

## Definition of Done

- [ ] "Continue with Google" button appears on the login screen
- [ ] Clicking it redirects to Google's OAuth consent page
- [ ] Completing Google auth redirects back and logs the user in with their name and picture
- [ ] A Google-authenticated user who signs up again via Google does not create a duplicate account
- [ ] `.env` contains `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (not committed)
- [ ] You can answer: what is the `state` parameter in OAuth and what attack does it prevent?
- [ ] You can answer: why is the code exchanged server-to-server rather than in the browser?
- [ ] You can answer: what is PKCE and when is it needed?
- [ ] You can answer: what does `verifyIdToken` check and why is it required?
- [ ] `git commit` with a message explaining why — "Add Google OAuth login with CSRF protection and id_token verification"
