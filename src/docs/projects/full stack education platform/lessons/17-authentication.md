# Lesson 17 — Authentication From First Principles

## What You Will Build

Sign up and log in with email and password. A logged-in user sees their name and a
personalised greeting. The auth state persists across app restarts (the user stays
logged in after closing and reopening the app).

This lesson covers the most security-critical code in the curriculum.

---

## What You Need to Know First

- Lesson 12: The `users` table in PostgreSQL
- Lesson 13: The Prisma ORM, database queries
- Lesson 14: Express routes, input validation with Zod
- Lesson 16: `fetch`, TanStack Query

---

## The Lesson

### Step 1 — Hashing vs Encryption

**Encryption** is reversible. A message encrypted with a key can be decrypted with the
key. Encryption is for data you need to recover (credit card numbers stored for future
charges, files at rest).

**Hashing** is not reversible. A password hashed with bcrypt cannot be recovered — not
by you, not by anyone. If your database is stolen, attackers cannot recover the passwords.

**Why hash passwords?** Because you do not need to recover them. When a user logs in,
you hash what they typed and compare it to the stored hash. If they match, the password
is correct. The original password is never stored.

**Why not a fast hash (SHA-256, MD5)?**
Fast hashes defeat their own purpose for passwords. An attacker with your hashed passwords
and a GPU can attempt billions of guesses per second. At that rate, a 6-character password
is cracked in seconds.

**bcrypt** is deliberately slow. It performs thousands of rounds of computation. This
makes each guess take milliseconds instead of nanoseconds. An attacker can attempt
thousands of guesses per second instead of billions. A 12-character password takes years
to crack by brute force.

**What a salt is:** A random value added to the password before hashing. Two users with
the same password produce different hashes because each has a different salt. This prevents
**rainbow table attacks** — pre-computed tables of hashes for common passwords. With a
unique salt per password, a rainbow table would need to be pre-computed for every salt value.

bcrypt incorporates the salt into the hash output, so you do not store the salt separately.

### Step 2 — JWT Tokens

A **JWT (JSON Web Token)** is a base64-encoded, signed JSON object. It has three parts
separated by dots: `header.payload.signature`.

**Header:** `{ "alg": "HS256", "typ": "JWT" }` — the algorithm used to sign.
**Payload:** `{ "userId": 42, "email": "alice@example.com", "iat": 1705312800, "exp": 1705316400 }`
**Signature:** HMAC-SHA256 of the encoded header + encoded payload, using your secret key.

**How verification works:** When the server receives a JWT, it:
1. Decodes the header and payload (base64 decoding — not secret, just encoding)
2. Recomputes the signature from the header + payload using its secret key
3. Compares the recomputed signature to the received signature
4. If they match, the payload has not been tampered with

**Why the server can verify without storing:** The signature proves the token was issued
by someone who knows the secret key. The server knows the secret key, so it can verify.
No database lookup required — any server with the key can verify any token.

**`iat` and `exp`:** `iat` is "issued at" (Unix timestamp). `exp` is "expires at".
The server rejects tokens with an `exp` in the past. Token expiry limits the damage
of a stolen token — it is only valid for its duration (typically 15 minutes to 1 hour).

**JWT secret management:** The secret key must be long (at least 256 bits — 32 random bytes)
and must never be in source code. Store it in `.env`:
```bash
JWT_SECRET=your-256-bit-random-secret-here
```
Anyone with the secret can forge tokens for any user. A leaked secret requires immediately
rotating it and invalidating all existing tokens.

### Step 3 — The Auth Routes

Install dependencies:
```bash
$ npm install bcryptjs jsonwebtoken
$ npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

Create `server/src/routes/auth.ts`:

```typescript
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../db'

const router = Router()

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/signup', async (req, res, next) => {
  try {
    const parsed = SignUpSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors })
    }

    const { email, password, name } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser !== null) {
      return res.status(400).json({ error: 'Email already in use' })
    }

    // Hash the password with bcrypt, cost factor 12
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true },
    })

    const token = generateToken(user.id)
    res.status(201).json({ user, token })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request' })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    // Always hash-compare even if user not found (prevents timing attacks)
    const passwordHash = user?.passwordHash ?? '$2a$12$invalidhash'
    const passwordMatches = await bcrypt.compare(password, passwordHash)

    if (user === null || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user.id)
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token })
  } catch (error) {
    next(error)
  }
})

function generateToken(userId: number): string {
  return jwt.sign(
    { userId },
    process.env['JWT_SECRET'] ?? throwMissingSecret(),
    { expiresIn: '1h' }
  )
}

function throwMissingSecret(): never {
  throw new Error('JWT_SECRET environment variable is not set')
}

export { router as authRouter }
```

**`bcrypt.hash(password, 12)` explained:**
The second argument is the **cost factor** (also called work factor or salt rounds).
`12` means bcrypt performs 2^12 = 4,096 rounds of key derivation. Each additional cost
factor doubles the time — `13` is twice as slow as `12`. Cost factor 12 takes ~300ms on
modern hardware — fast enough for login, slow enough to thwart brute-force attacks.

**`bcrypt.compare(password, hash)` explained:**
`compare` takes the plaintext password and the stored hash, re-hashes the password with
the salt embedded in the hash, and compares. It returns a Promise<boolean>. Always use
`compare` — never manually extract the salt and hash yourself.

**Timing attack prevention:**
The constant-time comparison note above: if you return "user not found" immediately (before
hashing) and "wrong password" after hashing, an attacker can measure the response time
to determine whether an email address exists in your database. By always performing the
hash comparison (even with a fake hash for non-existent users), the response time is
identical whether the user exists or not.

**`process.env['JWT_SECRET'] ?? throwMissingSecret()`:**
The `throwMissingSecret` function's return type is `never` — TypeScript knows it always
throws. This allows the `?? throwMissingSecret()` pattern: if the secret is missing,
throw immediately at startup rather than silently issuing invalid tokens.

**Security: HTTPS required for token transmission.**
Tokens sent over HTTP are visible to anyone who can intercept the network traffic
(coffee shop Wi-Fi, DNS-spoofing). TLS (HTTPS) encrypts the traffic. Authentication
must never be done over plain HTTP in production. The development server at `localhost`
is the only exception — all production traffic must use HTTPS.

### Step 4 — Auth Context in React

Add `passwordHash` to the Prisma schema, then create the auth context:

```typescript
// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface User {
  id: number
  email: string
  name: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStoredAuth() {
      const storedToken = await AsyncStorage.getItem('authToken')
      const storedUser = await AsyncStorage.getItem('authUser')

      if (storedToken !== null && storedUser !== null) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
      setIsLoading(false)
    }

    loadStoredAuth()
  }, [])

  async function login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error ?? 'Login failed')
    }

    const { user: loggedInUser, token: newToken } = await response.json()
    setUser(loggedInUser)
    setToken(newToken)

    await AsyncStorage.setItem('authToken', newToken)
    await AsyncStorage.setItem('authUser', JSON.stringify(loggedInUser))
  }

  function logout() {
    setUser(null)
    setToken(null)
    AsyncStorage.removeItem('authToken')
    AsyncStorage.removeItem('authUser')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) throw new Error('useAuth must be inside AuthProvider')
  return context
}
```

**`AsyncStorage` explained:** React Native does not have `localStorage` (a browser API).
`@react-native-async-storage/async-storage` provides a cross-platform key-value store
that persists across app restarts. It is **asynchronous** (returns Promises) — unlike
the browser's synchronous `localStorage`. Install it with:
```bash
$ npx expo install @react-native-async-storage/async-storage
```

**Security — token in `localStorage`/`AsyncStorage`:**
Storing the token in `localStorage` (web) or `AsyncStorage` (mobile) is vulnerable to
XSS on web — a script injected via XSS can read the token and send it to an attacker.
HttpOnly cookies are safer on web because scripts cannot read them. For mobile apps,
`AsyncStorage` is acceptable — the OS-level app sandbox prevents other apps from reading it.
The web shell (Lesson 31) should use HttpOnly cookies. Lesson 20 covers this in depth.

---

## Connect the Pieces

The `AuthProvider` pattern follows exactly the same structure as `LessonProvider` (Lesson 08):
`createContext` → `Provider` → custom hook. Every context in this app follows this pattern.

The `isLoading` state in `AuthProvider` is used by the app's navigation: while auth state
is loading from storage, show a splash screen instead of the main app or the login screen.
This prevents the login screen from flashing briefly before the stored token is loaded.

The JWT `exp` claim and token expiry will require a refresh token mechanism in a production
app: when the access token expires, use a long-lived refresh token to get a new access token.
Lesson 20 introduces refresh tokens as part of the session management discussion.

In production (GitHub, Stripe, Google), every API uses this pattern: a short-lived access
token in the Authorization header. The shape of the auth flow is standardised by OAuth 2.0,
which Lesson 19 builds on.

---

## What Breaks Without This

Using a fast hash (SHA-256) instead of bcrypt: with a modern GPU, an attacker can attempt
10 billion SHA-256 guesses per second. A typical user's 8-character password is in a
dictionary of 100 million common passwords — cracked in 0.01 seconds per user.
With bcrypt at cost factor 12 (~4,096 rounds), the same attack takes 4,000× longer.

The same error message for "user not found" and "wrong password" prevents username enumeration.
If your login says "that email is not registered," an attacker can enumerate all email addresses
in your database. Always respond with "Invalid email or password" regardless of which was wrong.

---

## Definition of Done

- [ ] `POST /api/auth/signup` creates a user with a bcrypt-hashed password
- [ ] `POST /api/auth/login` with correct credentials returns a JWT token
- [ ] `POST /api/auth/login` with wrong password returns 401 with a generic error
- [ ] The app stores the token in `AsyncStorage` and loads it on startup
- [ ] The logged-in user's name appears on the Profile screen
- [ ] Logging out clears the token and returns to the unauthenticated state
- [ ] You can answer: why is bcrypt better than SHA-256 for passwords?
- [ ] You can answer: what is a JWT's structure and how is verification done without a database lookup?
- [ ] You can answer: what is a timing attack and how does the login route prevent it?
- [ ] You can answer: why must auth only work over HTTPS in production?
- [ ] `git commit` with a message explaining why — "Add email/password auth with bcrypt hashing and JWT tokens"
