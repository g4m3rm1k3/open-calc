# Backend Lab — Lesson 14 — Authentication

## What You Will Build

Real registration (passwords hashed, never stored as plain text), real
login (verified by re-hashing, never by comparing plain text), and real
session tokens — replacing lesson 7's `requireAuth` stub, which never
actually verified *who* was asking, with something that genuinely does.

---

## What You Need to Know First

Lesson 7's `requireAuth` middleware and its honest disclosure that it
wasn't real authentication. Lesson 13's `db.query` and parameterized
queries.

---

## Step 1 — Feel What Lesson 7 Never Actually Checked

Lesson 7's `requireAuth` only asked one question: "is *any*
`Authorization` header present at all?" Send `POST /users` with
`Authorization: literally-anything` — it passes, every time, no matter
what the value actually is.

**SE lens — naming exactly what was missing, precisely.** Lesson 7 was
honest that this was a stand-in, not real security — now it's worth
naming exactly *what* was missing: nothing ever checked that the value
belonged to anyone real. A real authentication system has to answer two
separate questions — "does this credential exist" and "does it actually
belong to the person using it" — and lesson 7's version answered
neither.

---

## Step 2 — Register: Never Store a Plain-Text Password

```javascript
function register(request) {
  var data = JSON.parse(request.body);
  var hash = hashPassword(data.password);
  db.query("INSERT INTO credentials (username, password_hash) VALUES (?, ?)", [data.username, hash]);
  return { status: 201, body: { username: data.username } };
}
```

Notice the response never includes the password, or even the hash —
only the username comes back.

**Security lens — hashing, and why the raw password is never stored,
anywhere, even encrypted.** `hashPassword` (a new global this lab
provides, exactly like `db`) runs a real, standard cryptographic hash
function — SHA-256 — over the password, producing a fixed-length string
that looks nothing like the input. A **hash function** is **one-way**:
computing the hash from a password is easy; going *backward*, from the
hash to the original password, is not possible by design. Storing the
hash instead of the password means that even if `credentials` were ever
stolen entirely, the actual passwords inside it still wouldn't be
directly readable.

**Security lens — a real algorithm, with a real, honest limitation.**
SHA-256 is a genuine, widely-used cryptographic hash — not a toy. On its
own, though, it is **not what real production systems use for
passwords**, for a specific, concrete reason: SHA-256 is *fast* — a
modern computer can compute billions of SHA-256 hashes per second,
which means an attacker with a list of stolen hashes can simply try
guessing millions of common passwords per second until one matches
(this is why systems still get breached even when they hash passwords).
Real systems use algorithms built to be **deliberately slow**
(**bcrypt**, **scrypt**, **argon2**), combined with a random **salt**
per user (extra random data mixed into each password before hashing, so
two users with the same password don't produce the same hash, and
precomputed "rainbow table" attacks stop working). This lesson uses
plain SHA-256 to teach the *concept* of hashing honestly and
concretely — real password storage needs those two additional pieces on
top of it.

---

## Step 3 — Login: Verify by Re-Hashing, Never by Comparing Plain Text

```javascript
function login(request) {
  var data = JSON.parse(request.body);
  var rows = db.query("SELECT password_hash FROM credentials WHERE username = ?", [data.username]);
  if (rows.length === 0) {
    return { status: 401, body: { error: "Invalid credentials" } };
  }
  var attemptHash = hashPassword(data.password);
  if (attemptHash !== rows[0].password_hash) {
    return { status: 401, body: { error: "Invalid credentials" } };
  }
  var token = generateToken();
  db.query("INSERT INTO sessions (token, username) VALUES (?, ?)", [token, data.username]);
  return { status: 200, body: { token: token } };
}
```

Register, then log in with the wrong password — a real `401`. Log in
with the correct one — a real token comes back.

**Walkthrough — verifying without ever knowing the real password.** The
server never decrypts anything to check a password — it *can't*, since a
hash can't be reversed. Instead, it hashes whatever the login attempt
provided and compares the two **hashes** — `attemptHash !== rows[0].password_hash`.
If the original password and the attempt are the same string, hashing
them the same way always produces the same hash — this is the same
**determinism** lesson 1 named for functions generally, applied here as
the entire basis of how verification works at all.

**SE lens — the same error message for two different failures, on
purpose.** "No such username" and "wrong password for a real username"
both return the identical `401` message, `"Invalid credentials"` —
deliberately vague. Returning a more specific message ("no account with
that username" vs. "wrong password") would let an attacker use the
error message itself to discover which usernames are real, one guess at
a time — a real information leak, worth avoiding on purpose, not by
accident.

**CS lens — a session token, and why `generateToken` matters as much as
the password check.** Once logged in, the client is handed a **token**
— a long, random string standing in for "proof this request already
authenticated once." Every future request proves identity by sending
this token, instead of the actual password, every time.

---

## Step 4 — Why `generateToken` Uses Real Randomness

```javascript
function generateToken() {
  // Provided by this lab — uses the browser's real crypto.getRandomValues,
  // not Math.random()
}
```

**Security lens — predictable randomness is not randomness, for
security purposes.** `Math.random()` is *not* cryptographically secure —
it's fast and fine for a game's dice roll, but its output can, in
principle, be predicted by an attacker who studies enough of its
outputs, because it was never designed to resist that. A session token
generated with a predictable source could, in theory, be *guessed* —
completely defeating the point of requiring one at all. `generateToken`,
as this lab provides it, uses `crypto.getRandomValues` — the browser's
real, cryptographically secure random number generator, the same
primitive real authentication systems build tokens from. The difference
between "random enough for a game" and "random enough that guessing it
is computationally infeasible" is a real, important line, worth knowing
exists even where this project doesn't ask you to implement the
generator yourself.

---

## Step 5 — Protect a Route, For Real

```javascript
function requireAuth(request) {
  var token = request.headers.Authorization;
  if (!token) {
    return { status: 401, body: { error: "Not authenticated" } };
  }
  var sessionRows = db.query("SELECT username FROM sessions WHERE token = ?", [token]);
  if (sessionRows.length === 0) {
    return { status: 401, body: { error: "Not authenticated" } };
  }
  return null;
}
```

Send a protected request with no `Authorization` header — a real `401`.
Send one with a made-up token — also a real `401` (no matching row).
Send one with a real token from Step 3's login — it passes, exactly the
middleware shape lesson 7 already built, now backed by a real check.

**Walkthrough — checking for a missing token *before* querying with
it.** `if (!token) { return ...; }` runs before the database is ever
asked anything. Skipping this check and querying with `token` still
`undefined` doesn't fail gracefully — it produces a genuine, ugly
database-level error, not a clean `401`, because a query expects a real
value to bind, not "nothing at all." The same fail-fast shape lesson 5
established for validation applies here for exactly the same reason.

**Connect to the real world.** Real systems build on these exact same
pieces, at greater scale: bcrypt/scrypt/argon2 for password hashing
(Step 2's missing piece, named honestly); session tokens stored
server-side (what this lesson built) or self-contained signed tokens
like **JWT** (a different, real approach — the token itself carries
verifiable data, instead of being a lookup key into a table); and
larger identity systems like **OAuth**, which let one service vouch for
identity to another entirely. Every one of them is solving the same two
problems this lesson did: prove who someone is once, then let them
prove it again cheaply on every later request.

---

## Connect the Pieces

```
register: password --hashPassword-->  password_hash  -->  credentials table
login:    password --hashPassword-->  attemptHash  ==  credentials.password_hash ?
                                              |
                                     generateToken()  -->  sessions table
protected route:  Authorization header  -->  sessions table lookup  -->  allow / 401
```

---

## What Breaks Without This

**Querying with a missing token instead of checking first**: a genuine,
ugly low-level database error surfaces instead of a clean `401` — the
exact bug reproduced and fixed in Step 5.

**Comparing passwords directly instead of hashes** (storing and checking
`data.password` itself, skipping `hashPassword` entirely): the instant
`credentials` is ever read by anyone who shouldn't (a bug, a breach, a
careless log line), every real password is sitting there in plain,
readable text — the single most consequential mistake this lesson
exists to prevent.

**Returning different error messages for "no such user" versus "wrong
password"**: leaks exactly which usernames are registered to anyone
willing to try logging in repeatedly and read the difference.

---

## Definition of Done

- [ ] Registering, then logging in with the correct password, returns a real token
- [ ] Logging in with the wrong password returns a `401`, identical in wording to a nonexistent username
- [ ] A protected route rejects a missing token and a made-up token, and accepts a real one from a successful login
- [ ] You can explain what a one-way hash function is and why the original password can't be recovered from it
- [ ] You can explain why plain SHA-256 alone isn't sufficient for real production password storage
- [ ] You can explain why `Math.random()` is unsuitable for generating a security token
- [ ] You can explain why the missing-token check has to happen before querying the database with it

---

*This completes the Backend Lab series — from a single failing
`handleRequest` through routing, controllers, middleware, services,
persistence, real SQL, and now real authentication. Every layer this
series built is still there, doing exactly the one job it was given.*
