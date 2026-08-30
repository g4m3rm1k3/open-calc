# Lesson 8: Testing Real Sign-In

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. This is the first real
> *feature* slice this series builds — everything before it was the
> walking skeleton: a backend, a frontend, a real connection between
> them, real styling, and no feature at all. Login is a genuinely
> deeper, separate slice, built on top of that now-finished skeleton,
> not folded into it.

## What you will build

A real, automated characterization of `POST /api/auth/login` — legacy's
own, already-existing, already-working sign-in route — covering its
three real, distinct outcomes: missing input, wrong credentials, and a
real, successful sign-in. This lesson does not touch `rebuild` at all;
it proves, honestly, exactly what legacy's own real behavior already
is, and proves the identical real test fails honestly against
`rebuild`, which has no `/api/auth/login` route yet. Building that
route for real — with an actual database, an actual user, and an
actual design decision about how the authentication logic itself is
structured — is a separate, later lesson's own real job.

## What you need to know first

The real acceptance-test harness (`acceptance-tests/target.py`) and its
`ACCEPTANCE_TARGET` switch, already built and proven against `/health`.
`Flask.test_client()`'s own real `.get(path)` method, already used;
this lesson extends it to `.post(path, json=...)`.

## Terms introduced

- **User enumeration** — a real security weakness where a system's own
  responses let an attacker learn *which* real inputs are valid,
  separately from whether the *whole* real attempt succeeded — for
  login specifically, a system that says "no such user" for an unknown
  email but "wrong password" for a known one has just confirmed, for
  free, that the email exists at all, real information an attacker
  never needed to be given. A real, correct login route avoids this by
  giving the identical real, generic error for every real way a login
  attempt can fail to authenticate, checked directly against legacy's
  own real behavior in this lesson's own second Concept Unit.
- **JWT** (JSON Web Token) — a real, standard, self-contained token
  format: three real, dot-separated, Base64-encoded parts — a header, a
  payload, and a cryptographic signature — that a server can issue once
  and later verify without keeping any real, server-side record of
  having issued it. This lesson does not decode or verify one yet — only
  confirms legacy's own real login route actually returns something
  real, structurally shaped like one; verifying what's actually inside
  a real JWT is a separate, later lesson's own concern.

## Objects and methods used

- **`Flask.test_client().post(path, json=data)`**
  - *What it is:* a real method on the real `FlaskClient` object
    `Flask.test_client()` returns — the same real object this series'
    own `.get(path)` calls already use, now called with its own real
    `.post(...)` method instead.
  - *Implementation:* checked against Flask's own official
    documentation this session — sends a real, in-process HTTP `POST`
    request to the given real path; the real `json=` keyword argument
    takes a real Python `dict`, serializes it to real JSON text,
    attaches it as the real request body, and sets the real
    `Content-Type: application/json` header automatically — the exact
    real shape a genuine browser-based `fetch(..., { method: 'POST',
    body: JSON.stringify(...) })` call would also produce, without this
    lesson's own test needing to build any of that by hand.
  - *Its use:* this lesson's own real tests call it, once per real
    case, with a real, in-process `POST /api/auth/login` request and a
    real, varying JSON body.
  - *Type:* an instance method on the real `FlaskClient` object,
    returning a real `Response`.
  - *Responsibility:* sending one real, fully-formed HTTP request,
    JSON body included, without a real, separately-running server or a
    real network socket — the identical real in-process mechanism
    `.get(path)` already uses, extended to a real request body.
  - *Depends on:* a real, already-constructed `FlaskClient`, a real
    path, and, for `json=`, a real, JSON-serializable Python value.
  - *Connects to:* called directly by this lesson's own real tests;
    routed, by Flask's own real, internal dispatch, to legacy's own
    real `login()` view function.
  - *Shape:* the identical real Flask/Werkzeug testing boundary this
    series' own `.get(path)` calls already established, now exercised
    with a real request body for the first time.

---

## Concept Unit: A Route That Never Says Which Part Was Wrong

### The Problem

Legacy's own real `POST /api/auth/login` route already exists, already
runs, and already handles real, invalid attempts somehow — but exactly
*how* it handles them is, so far, only readable, not proven. The real
question this unit answers: what, precisely, does legacy actually do,
for real, when a real request is missing required fields, or names a
real email that doesn't exist, or names a real email that does exist
with the wrong real password — and does it do the last two identically,
the real, correct way to avoid **user enumeration**?

> **Before reading on:** if a real login route returned a different
> real error for "no such user" than it did for "wrong password," what
> real, extra fact would a real attacker learn from a failed attempt
> that a real, correct route would never actually reveal?

### Project Change

- **Reference Source** — `backend/app/routes/auth.py`, the real
  `login()` function, read in full this session: extracts `email`/
  `password` from a real JSON body, returns a real `400` with
  `{'error': 'Email and password required'}` if either is missing;
  otherwise looks up a real `User` by email and checks its real,
  hashed password; on any real failure — email not found, or password
  wrong — returns the identical real `401` with
  `{'error': 'Invalid credentials'}`, never anything more specific.
  This unit characterizes that real, already-existing behavior; it
  changes nothing about it.
- **Files affected** — created: `acceptance-tests/test_login.py`.
- **Change type** — add (new file).
- **Location** — directly inside the existing real `acceptance-tests/`
  folder, sibling to `target.py` and `test_health.py`.
- **Dependencies** — none beyond what this project's shared
  acceptance-test harness already installed.

### The New Code

```python
from target import get_client


def test_login_missing_fields_returns_400():
    client = get_client()
    response = client.post('/api/auth/login', json={'email': 'admin@mfg.com'})
    assert response.status_code == 400
    body = response.get_json()
    assert 'error' in body


def test_login_unknown_email_returns_401_generic_error():
    client = get_client()
    response = client.post('/api/auth/login', json={
        'email': 'no-such-user@mfg.com',
        'password': 'whatever',
    })
    assert response.status_code == 401
    body = response.get_json()
    assert body['error'] == 'Invalid credentials'


def test_login_wrong_password_returns_the_same_401_generic_error():
    client = get_client()
    response = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'not-the-real-password',
    })
    assert response.status_code == 401
    body = response.get_json()
    assert body['error'] == 'Invalid credentials'
```

### The Updated Project

`acceptance-tests/test_login.py`, not yet complete — this unit's own
three real cases; the fourth, real success case is a separate, later
unit in this same lesson, added to the same file:

```python
1  from target import get_client
2
3
4  def test_login_missing_fields_returns_400():
5      client = get_client()
6      response = client.post('/api/auth/login', json={'email': 'admin@mfg.com'})
7      assert response.status_code == 400
8      body = response.get_json()
9      assert 'error' in body
10
11
12 def test_login_unknown_email_returns_401_generic_error():
13     client = get_client()
14     response = client.post('/api/auth/login', json={
15         'email': 'no-such-user@mfg.com',
16         'password': 'whatever',
17     })
18     assert response.status_code == 401
19     body = response.get_json()
20     assert body['error'] == 'Invalid credentials'
21
22
23 def test_login_wrong_password_returns_the_same_401_generic_error():
24     client = get_client()
25     response = client.post('/api/auth/login', json={
26         'email': 'admin@mfg.com',
27         'password': 'not-the-real-password',
28     })
29     assert response.status_code == 401
30     body = response.get_json()
31     assert body['error'] == 'Invalid credentials'
```

### Mechanical Walkthrough

- **Line 1, `from target import get_client`** — this project's own,
  already-built acceptance-test harness, reused unchanged.
- **Line 4, `def test_login_missing_fields_returns_400():`** — an
  ordinary Python function, `test_`-prefixed for `pytest`'s own real
  discovery, already given full treatment when this series' very first
  test was written.
- **Line 6, `client.post('/api/auth/login', json={'email':
  'admin@mfg.com'})`** — this lesson's Header's own
  `.post(path, json=data)`, called with a real, deliberately incomplete
  body: an email, no password.
- **Lines 7–9, the real assertions** — `response.status_code == 400`
  checks legacy's own real, documented behavior for missing input;
  `'error' in body` checks only that a real, explanatory key exists,
  deliberately *not* pinning its exact real string — this unit's own
  real claim is "something informative comes back," not the precise
  wording, which legacy's own real `login()` function could reasonably
  reword without this being a real behavior change worth failing a test
  over.
- **Line 12, `def test_login_unknown_email_returns_401_generic_error():`**
  — a real, second, independent test function.
- **Lines 13–17, the real request** — a real email that does not exist
  in legacy's own real, seeded user table, with an arbitrary real
  password.
- **Lines 18–20, the real assertions** — `401`, and the real, exact
  string `'Invalid credentials'` — unlike the missing-fields case,
  above, this unit's own real claim *does* pin the exact real wording,
  specifically so the next test, below, can prove it's identical.
- **Line 23, `def test_login_wrong_password_returns_the_same_401_generic_error():`**
  — a real, third, independent test function, its own real name stating
  the actual real claim this unit exists to prove.
- **Lines 24–28, the real request** — a real, known-valid email
  (legacy's own real, seeded `admin@mfg.com`), with a real, deliberately
  wrong password.
- **Lines 29–31, the real assertions** — the identical real `401` and
  the identical real string `'Invalid credentials'` as the previous
  test's own unknown-email case — real, mechanical proof that legacy's
  own route gives the same real answer whether the real email exists or
  not, exactly this lesson's Header's own **User enumeration** term,
  proven rather than assumed.

### CS Lens

This is a real instance of **information-theoretic minimality** in an
error response — a real security-relevant idea: a system's own output
should carry exactly as much real information as the situation
actually requires, and no more. Two real, different failure causes
(no such user; wrong password) collapsing into one identical real
response is a deliberate real reduction in information, not a real
loss of quality.

Also recognized in: a real ATM giving an identical "transaction
declined" message for insufficient funds and for a stolen card; a real
"file not found" served identically whether a path genuinely doesn't
exist or exists but is real, forbidden, so a real attacker can't
distinguish the two; any real system where a more specific real error
message would leak real information an adversary shouldn't have.

### SE Lens

The real, deliberately *not*-taken alternative here: pinning the exact
real string for the missing-fields `400` case too, the same way the
`401` cases are pinned. Rejected on purpose — the missing-fields case
is not a real security-sensitive boundary the way the two `401` cases
are; requiring an *exact* real string there would make this test
needlessly fragile against a real, harmless future wording change,
while the two `401` cases genuinely need their real, exact string
pinned, since the entire real point of this unit is proving those two,
different real situations produce *identical* output — a real
assertion that would be worthless if it didn't check the actual real
value.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_login.py -v
```

### Run it, per the Verification Rule

Real, actually run this session against legacy — every case really
passes:

```
verification/proofs/lesson_08_login.py::test_login_missing_fields_returns_400 PASSED
verification/proofs/lesson_08_login.py::test_login_unknown_email_returns_401_generic_error PASSED
verification/proofs/lesson_08_login.py::test_login_wrong_password_returns_the_same_401_generic_error PASSED
verification/proofs/lesson_08_login.py::test_login_valid_credentials_returns_token_and_user PASSED

4 passed in 6.74s
```

(Full real capture, all four cases together:
`verification/proofs/lesson_08_login.py`, this repository's own root —
not the shared `acceptance-tests/` harness itself, which stays blank for
the reader to type by hand, matching `test_health.py`'s own treatment
since the very first lesson that used it.)

### Connecting this unit to what came before

Every backend lesson so far characterized one, single real outcome —
`/health`'s one real answer, `Part.to_dict()`'s one real shape. This
unit is the first time this series characterizes a real route with
more than one real, meaningfully different outcome, and proves two of
those outcomes are deliberately, provably identical.

---

## Concept Unit: A Real, Successful Sign-In

### The Problem

The previous unit proved what legacy's own real route does when sign-in
fails. The real question this unit answers: what does it actually,
concretely return when sign-in *succeeds* — and how much of that real
response is safe to check without this lesson accidentally depending on
one real, specific token's exact bytes, which will never be the same
real value twice?

### Project Change

- **Reference Source** — `backend/app/routes/auth.py`, the real
  `login()` function's own success path, read in full this session: on
  a real match, returns a real `200` with `{'message': 'Login
  successful', 'token': auth_token, 'user': user.to_dict()}`, where
  `auth_token` is a real, freshly-generated JWT and `user.to_dict()` —
  `backend/app/models/user.py`, read in full this session — returns
  `id`, `email`, `name`, `role`, `mustChangePassword`, `createdAt`, and
  `lastLogin`, never the real, hashed `password_hash` field at all.
- **Files affected** — modified: `acceptance-tests/test_login.py`.
- **Change type** — add (one more real function, to the existing file).
- **Location** — appended to the end of the file the previous unit
  created.
- **Dependencies** — none new.

### The New Code

```python
def test_login_valid_credentials_returns_token_and_user():
    client = get_client()
    response = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'admin',
    })
    assert response.status_code == 200
    body = response.get_json()

    token = body['token']
    assert isinstance(token, str)
    assert token.count('.') == 2  # JWT: header.payload.signature

    user = body['user']
    assert user['id'] == 'admin'
    assert user['email'] == 'admin@mfg.com'
    assert user['role'] == 'admin'
    assert 'password_hash' not in user
    assert 'password' not in user
```

### The Updated Project

`acceptance-tests/test_login.py`, in full — the previous unit's own
three real functions, plus this unit's own fourth, so this is the whole
file:

```python
1  from target import get_client
2
3
4  def test_login_missing_fields_returns_400():
5      client = get_client()
6      response = client.post('/api/auth/login', json={'email': 'admin@mfg.com'})
7      assert response.status_code == 400
8      body = response.get_json()
9      assert 'error' in body
10
11
12 def test_login_unknown_email_returns_401_generic_error():
13     client = get_client()
14     response = client.post('/api/auth/login', json={
15         'email': 'no-such-user@mfg.com',
16         'password': 'whatever',
17     })
18     assert response.status_code == 401
19     body = response.get_json()
20     assert body['error'] == 'Invalid credentials'
21
22
23 def test_login_wrong_password_returns_the_same_401_generic_error():
24     client = get_client()
25     response = client.post('/api/auth/login', json={
26         'email': 'admin@mfg.com',
27         'password': 'not-the-real-password',
28     })
29     assert response.status_code == 401
30     body = response.get_json()
31     assert body['error'] == 'Invalid credentials'
32
33
34 def test_login_valid_credentials_returns_token_and_user():
35     client = get_client()
36     response = client.post('/api/auth/login', json={
37         'email': 'admin@mfg.com',
38         'password': 'admin',
39     })
40     assert response.status_code == 200
41     body = response.get_json()
42
43     token = body['token']
44     assert isinstance(token, str)
45     assert token.count('.') == 2  # JWT: header.payload.signature
46
47     user = body['user']
48     assert user['id'] == 'admin'
49     assert user['email'] == 'admin@mfg.com'
50     assert user['role'] == 'admin'
51     assert 'password_hash' not in user
52     assert 'password' not in user
```

### Mechanical Walkthrough

- **Lines 36–39, the real request** — legacy's own real, seeded admin
  account (`admin@mfg.com` / `admin`), a real, already-known-valid
  credential pair, not a value this test invents.
- **Line 40, `assert response.status_code == 200`** — the real, correct
  status for a successful real sign-in.
- **Line 43, `token = body['token']`** — reads the real JWT string
  legacy's own route actually returned, without decoding it.
- **Line 44, `assert isinstance(token, str)`** — `isinstance`, a real,
  standard Python function checking a real value's real type; confirms
  a real string came back, nothing more specific yet.
- **Line 45, `assert token.count('.') == 2`** — `.count('.')`, a real,
  standard Python string method, counting real occurrences of the
  literal character `.`; a real JWT is always exactly three real,
  dot-separated parts, so exactly two real dots is the smallest real,
  meaningful check that *something JWT-shaped* came back, without this
  test needing to actually decode it, verify its real signature, or
  depend on any of its real, specific byte content — content that
  legitimately changes on every single real login, since it includes a
  real, current timestamp.
- **Line 47, `user = body['user']`** — reads the real, nested user
  object legacy's own route returns alongside the token.
- **Lines 48–50, the three real identity assertions** — `id`, `email`,
  `role` all checked against the real, known values of legacy's own
  real, seeded admin account.
- **Lines 51–52, `assert 'password_hash' not in user` /
  `assert 'password' not in user`** — real, negative assertions: proving
  something is *absent*, not present — checking that legacy's own real
  route never leaks the real, hashed password (or any real plaintext
  password) back to a real client, a real, security-relevant property
  worth checking explicitly rather than assuming from reading the code
  alone.

### CS Lens

This is a real instance of checking a **structural property instead of
an exact value** — `token.count('.') == 2` proves *shape* (three
real parts) without depending on *content* (the real, specific bytes),
the same real distinction between "is this well-formed" and "is this
this exact one" that recurs anywhere a real value is expected to change
on every real run but its real shape is still a genuine, checkable
guarantee.

Also recognized in: checking a real UUID's own real, standard format
(`8-4-4-4-12` real hex groups) without checking which specific real
UUID came back; checking a real timestamp's own real, parseable format
without checking which specific real moment it names; any real test
asserting "this is well-formed" instead of "this is identical to a
fixture," because the real, correct value is inherently non-deterministic.

### SE Lens

The real, deliberately *not*-taken alternative here: decoding the real
JWT and verifying its real, signed claims (`sub`, `role`, `exp`) as
part of this same test. Rejected on purpose, for now — that would
require this test to know legacy's own real, secret signing key, or to
call legacy's own real `decode_auth_token` function directly, either of
which couples this real, external, black-box acceptance test to
legacy's own real, internal implementation detail — precisely what an
acceptance test, per this series' own already-established **Acceptance
test** term, is supposed to avoid. Checking the token is *shaped* like
a real JWT, and separately checking the real, returned `user` object's
own real, visible fields, proves everything a real client of this API
could actually observe, without this test reaching past that real,
external contract.

### Commands needed

No new command beyond the previous unit's — `acceptance-tests/test_login.py`
now has all four real cases.

### Run it, per the Verification Rule

Real, actually run this session against legacy — see the previous
unit's own real capture for the full four-case output
(`verification/proofs/lesson_08_login.py`, this repository's own root);
real seeded users (`admin@mfg.com` / `admin`) confirmed used directly,
matching the values this unit's own test hard-codes.

Real doubt existed for the `rebuild` side too, so this was also actually
run this session, against a real, already-built walking-skeleton backend
(the identical shape the reader's own `rebuild/backend` will be in by
this point, once they've actually worked through the walking-skeleton
lessons themselves) — a real `POST /api/auth/login`, with this exact
unit's own real credentials:

```
status: 404
```

Confirming, for real, not from prediction alone: `rebuild/backend` had
no real `app` package at all when the walking skeleton's own first
lesson proved its own real RED — the `ModuleNotFoundError` earlier
lessons actually saw. It does now — the walking-skeleton slice already
built a real, working `/health` route there. What genuinely doesn't
exist yet is a real `/api/auth/login` route registered anywhere on that
real, already-working application, and Flask's own real, documented,
default behavior for a request matching no registered route is a real
`404` — the correct, honest starting RED for this slice's own
implementation half, a later, separate lesson's real job.

### Connecting this unit to what came before

The previous unit proved legacy's own real route fails identically for
two different real reasons. This unit proves what it does when nothing
is wrong at all — the complete real contract this whole slice's own
later, deeper implementation work now has to satisfy.

---

## Connect the pieces

Four real, distinct outcomes of one real route — missing input, an
unknown email, a wrong password, and a genuine success — are now all
real, automated, machine-checked claims, proven against legacy and
proven, honestly, not yet true against `rebuild`. Nothing about
*how* legacy achieves any of this was assumed; every real claim traces
to legacy's own real, read source. Building the identical real behavior
into `rebuild` — with an actual database, an actual user, and a real,
deliberate design decision about where the authentication logic itself
lives — is this slice's own next, separate, and considerably deeper
real work.

---

**Next lesson:** the first real piece of infrastructure login's own
real implementation needs before any of these four tests can even
begin to pass against `rebuild` — a real database connection, since
nothing in `rebuild/backend` has ever needed one until now.
