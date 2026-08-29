# Lesson 18: Testing the Real Parts List

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. This is a real, third,
> separate feature slice, built on top of real sign-in and real
> authorization — the first slice reaching past the `User` table
> entirely, into this application's own actual, real subject matter: a
> `Part`, the thing a manufacturing shop is actually making.

## What you will build

A real, automated characterization of legacy's own, already-existing
`GET /api/parts` — covering its real, empty-table response shape, its
real role-gating for a role the route doesn't allow, and a real,
already-existing special case this series has only named in passing
until now: **legacy allows some requests through with no token at all.**
This lesson does not touch `rebuild` at all; it proves, honestly, what
legacy's own real behavior already is — all of it, including the parts
that don't fit the pattern this series has taken for granted since real
sign-in — and proves the identical real test fails honestly against
`rebuild`, which has no `/api/parts` route yet.

## What you need to know first

The real, already-tested `token_required(allowed_roles=None)` decorator
and its real 401/403 distinction. This project's own shared
acceptance-test harness, and its own, already-established pattern of
building real test fixtures through already-proven real routes
(`/api/auth/login`, `/api/auth/register`) rather than reaching around
the API.

## Terms introduced

- **Operator bypass** — a real, existing special case inside legacy's
  own `token_required`: when a real request carries no token at all,
  and `'operator'` is among the specific route's own allowed roles, the
  request proceeds anyway, with no real, authenticated identity at all
  — the decorated view function receives a real, literal `None` where
  it would otherwise receive a real `User`. This is not a hypothetical
  or a guess about what legacy *might* do; it is real, existing code,
  read and confirmed running this session, and it directly contradicts
  the pattern every real route this series has tested so far —
  `/api/auth/users`, this series' own prior authorization lesson,
  returns a real `401` for the identical, no-token case. `GET
  /api/parts` does not, because `'operator'` is one of its own allowed
  roles and `/api/auth/users` never allows that role at all. What (if
  anything) `rebuild` does about this is a real, separate,
  deliberately-deferred design decision — not this lesson's own job;
  this lesson exists only to prove, honestly, that legacy really does
  this, right now, for real.
- **Collection envelope** — a real, standard shape for a list-returning
  HTTP response: not a bare, real JSON array, but a real, plain object
  wrapping it — here, `{'data': [...], 'total': N}` — so a real client
  can read how many real items exist without counting the array itself,
  and so the real response has room to grow (pagination info, for one
  real example) without breaking every real client already parsing it.

## Objects and methods used

- **`Flask.test_client().get(path, headers=...)`**
  - *What it is:* this series' own real, already-used `.get(path)`
    method, now called with a real, additional `headers=` keyword
    argument — the identical real argument this series' own
    authorization-testing lesson already gave full treatment to on
    `.post(...)`.
  - *Implementation:* checked against Flask's own official
    documentation this session — `headers=` takes a real, plain Python
    `dict`, attached to the real, simulated `GET` request as real HTTP
    headers, identical in real effect to attaching them to a real
    `POST` — the same real mechanism, a genuinely different real HTTP
    method.
  - *Its use:* this lesson's own real tests use it to attach a real,
    valid token (or, deliberately, no `headers=` argument at all) to a
    real, protected `GET` request.
  - *Type:* the identical real method already given full treatment;
    `headers=` is simply one more real, optional keyword argument on
    it, usable on any real HTTP method this series' own test client
    exposes.
  - *Responsibility:* the identical real responsibility already
    established for `.post(...)`, now exercised on a real `GET`.
  - *Depends on:* the identical real dependencies already established.
  - *Connects to:* Flask's own real, internal request-parsing code,
    which legacy's own real `token_required` reads the real
    `Authorization` header from — the identical real seam this series'
    own authorization-testing lesson already proved.
  - *Shape:* the identical real Flask/Werkzeug testing boundary already
    established, now reached through `GET` instead of `POST`.

---

## Concept Unit: A Route That Doesn't Always Ask First

### The Problem

`GET /api/parts` already exists in legacy, already runs, and its own
real decorator — `@token_required(allowed_roles=['operator', 'quality',
'programming', 'admin'])` — looks, at a glance, exactly like every
other protected route this series has already characterized. Every
prior protected route this series has tested returns a real `401` for a
request with no token at all. The real question this unit answers: does
*this* route really behave the identical way, or does something about
its own specific, real, allowed-role list change what actually happens?

> **Before reading on:** this series' own **Operator bypass** term,
> above, already gives away the real mechanism. Before trusting that —
> a real claim about legacy's own code, not yet proven by a real,
> automated test in this series — what real, direct way could you
> confirm it, using only tools this series has already built?

### Project Change

- **Reference Source** — `backend/app/utils/auth_utils.py`, the real
  `token_required` function, read in full this session, specifically
  the real block handling a missing token: `if not token: if
  allowed_roles and 'operator' in allowed_roles: return f(None, *args,
  **kwargs)` — real, existing code, proceeding with a real, literal
  `None` in place of a real `User`, before ever reaching the real `401`
  case every other route this series has tested actually hits.
  `backend/app/routes/parts.py`, the real `get_parts` function, read in
  full this session: decorated `@token_required(allowed_roles=
  ['operator', 'quality', 'programming', 'admin'])`, building a real,
  optionally-filtered `Part.query`, and returning this lesson's Header's
  own real **Collection envelope** — `{'data': [...], 'total':
  len(parts)}`.
- **Files affected** — created: `acceptance-tests/test_parts.py`.
- **Change type** — add (new file).
- **Location** — directly inside the existing real `acceptance-tests/`
  folder, sibling to `target.py`, `test_login.py`, and
  `test_authorization.py`.
- **Dependencies** — none beyond this project's own shared
  acceptance-test harness.

### The New Code

```python
from target import get_client


def test_list_parts_with_no_token_succeeds_via_the_operator_bypass():
    client = get_client()
    response = client.get('/api/parts')
    assert response.status_code == 200
    assert response.get_json() == {'data': [], 'total': 0}


def test_list_parts_rejects_a_role_not_in_the_allowed_list():
    client = get_client()

    login = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'admin',
    })
    admin_token = login.get_json()['token']

    register = client.post('/api/auth/register', json={
        'email': 'eng@mfg.com',
        'password': 'temporary',
        'name': 'Design Engineer',
        'role': 'engineering',
    }, headers={'Authorization': f'Bearer {admin_token}'})
    assert register.status_code == 201

    eng_login = client.post('/api/auth/login', json={
        'email': 'eng@mfg.com',
        'password': 'temporary',
    })
    eng_token = eng_login.get_json()['token']

    response = client.get('/api/parts', headers={
        'Authorization': f'Bearer {eng_token}',
    })
    assert response.status_code == 403


def test_list_parts_with_a_valid_allowed_role_returns_the_identical_real_shape():
    client = get_client()

    login = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'admin',
    })
    admin_token = login.get_json()['token']

    response = client.get('/api/parts', headers={
        'Authorization': f'Bearer {admin_token}',
    })
    assert response.status_code == 200
    assert response.get_json() == {'data': [], 'total': 0}
```

### The Updated Project

`acceptance-tests/test_parts.py`, in full — brand new, so this is the
whole file:

```python
1  from target import get_client
2
3
4  def test_list_parts_with_no_token_succeeds_via_the_operator_bypass():
5      client = get_client()
6      response = client.get('/api/parts')
7      assert response.status_code == 200
8      assert response.get_json() == {'data': [], 'total': 0}
9
10
11 def test_list_parts_rejects_a_role_not_in_the_allowed_list():
12     client = get_client()
13
14     login = client.post('/api/auth/login', json={
15         'email': 'admin@mfg.com',
16         'password': 'admin',
17     })
18     admin_token = login.get_json()['token']
19
20     register = client.post('/api/auth/register', json={
21         'email': 'eng@mfg.com',
22         'password': 'temporary',
23         'name': 'Design Engineer',
24         'role': 'engineering',
25     }, headers={'Authorization': f'Bearer {admin_token}'})
26     assert register.status_code == 201
27
28     eng_login = client.post('/api/auth/login', json={
29         'email': 'eng@mfg.com',
30         'password': 'temporary',
31     })
32     eng_token = eng_login.get_json()['token']
33
34     response = client.get('/api/parts', headers={
35         'Authorization': f'Bearer {eng_token}',
36     })
37     assert response.status_code == 403
38
39
40 def test_list_parts_with_a_valid_allowed_role_returns_the_identical_real_shape():
41     client = get_client()
42
43     login = client.post('/api/auth/login', json={
44         'email': 'admin@mfg.com',
45         'password': 'admin',
46     })
47     admin_token = login.get_json()['token']
48
49     response = client.get('/api/parts', headers={
50         'Authorization': f'Bearer {admin_token}',
51     })
52     assert response.status_code == 200
53     assert response.get_json() == {'data': [], 'total': 0}
```

### Mechanical Walkthrough

- **Line 1, `from target import get_client`** — this project's own,
  already-built acceptance-test harness, reused unchanged.
- **Line 4, `def test_list_parts_with_no_token_succeeds_via_the_operator_bypass():`**
  — an ordinary, `test_`-prefixed real function, its own real name
  stating this unit's actual real claim.
- **Line 6, `response = client.get('/api/parts')`** — this lesson's
  Header's own `.get(path, headers=...)`, called here with *no*
  `headers=` argument at all — a real, deliberate absence, not an
  oversight: this is the real, literal case of a client sending no
  proof of identity whatsoever.
- **Lines 7–8, the real assertions** — `response.status_code == 200`,
  not `401` — this lesson's Header's own **Operator bypass** term,
  proven rather than described; `response.get_json() == {'data': [],
  'total': 0}` — this lesson's Header's own **Collection envelope**,
  checked as a real, exact, whole-object match rather than piece by
  piece, since a real, empty table has nothing more specific to assert.
- **Lines 14–18, a real admin sign-in** — reuses this project's own,
  already-proven real login route directly, the identical real pattern
  this series' own authorization-testing lesson already established:
  build real fixtures through already-tested real behavior, never by
  reaching around the API.
- **Lines 20–26, registering a real engineering user** — a real,
  admin-only route, called with the real admin token just obtained,
  creating a real user whose own real role — `'engineering'` — is
  deliberately *not* among `GET /api/parts`'s own real, allowed set.
- **Lines 28–32, a real, second sign-in** — obtains a real, valid token
  for that specific, real, disallowed role.
- **Lines 34–37, the real, restricted request** — `assert
  response.status_code == 403`: this lesson's Header's own,
  already-established 401/403 distinction, applied again in full: this
  real request carries a real, genuinely valid token — legacy knows
  exactly who this is — and still says no, because this specific real
  role isn't on this specific real route's own allowed list. This is
  the real, honest proof that `GET /api/parts` isn't simply "open to
  anyone" — the **Operator bypass** only ever lets an *unauthenticated*
  request through; a real, authenticated request for a genuinely
  disallowed role is still refused, exactly as firmly as any other
  protected route this series has tested.
- **Lines 43–52, the real, normally-authenticated case** — the
  identical real request as the first test, this time with a real,
  valid, allowed admin token attached — and the identical real `200`
  and identical real, empty envelope come back. Proving this
  separately from the first test is deliberate, not redundant: it
  proves the *normal*, authenticated path produces the identical real
  result the **Operator bypass** does, for a genuinely different real
  reason — two real, independent claims that happen to agree, not one
  claim assumed to cover both.

### CS Lens

This is a real instance of proving **two different real mechanisms
converge on one real result** — the identical real discipline this
series' own real sign-in slice already used to prove an unknown email
and a wrong password produce the identical real `401`. There, two real
*failures* were proven identical; here, a real *bypass* and a real
*authenticated success* are proven identical instead — the same real
testing habit, applied to convergence on a real success this time, not
only on a real failure.

Also recognized in: any real system where a public, cached response and
a real, freshly-computed one are proven to return byte-identical real
output; any real API where an anonymous and an authenticated client are
deliberately given the identical real view of non-sensitive real data.

### SE Lens

The real, deliberately *not*-taken alternative here: treating the
**Operator bypass** as a real, obvious bug the instant it was found, and
silently "fixing" this lesson to expect a `401` instead of what legacy
actually, really does. Rejected on purpose — this series' own real,
established rule distinguishes an actual, established bug from a real,
if debatable, deliberate design choice, and legacy's own real code
comments this exact behavior as an intentional feature (`# Use case:
Operator dashboard that anyone can view`), not an oversight. A testing
lesson's own real job is characterizing what legacy actually does,
honestly, whether or not that behavior turns out to be what `rebuild`
eventually does too — that real design decision belongs to a separate,
later, implementation lesson, made deliberately, not smuggled in here
by quietly testing for the behavior this series *expected* instead of
the behavior legacy *has*.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_parts.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — this lesson's own central claim is a real
surprise relative to every prior protected route this series has
tested, so this was actually run this session, not predicted:

```
test_parts.py::test_list_parts_with_no_token_succeeds_via_the_operator_bypass PASSED
test_parts.py::test_list_parts_rejects_a_role_not_in_the_allowed_list PASSED
test_parts.py::test_list_parts_with_a_valid_allowed_role_returns_the_identical_real_shape PASSED

3 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state: `GET /api/parts` does not exist there at all yet, so Flask's own
real, documented default behavior for an unmatched real path answers
with a real `404` — the correct, honest starting RED for this slice's
own implementation work, still ahead.

### Connecting this unit to what came before

Every protected route this series has tested until now agreed on one
real rule: no token means `401`, no exceptions. This unit is the first
time that assumed rule turns out to have a real, documented exception —
proven, not guessed at, before this slice builds anything real on top
of it.

---

## Connect the pieces

Three real, distinct outcomes of one real route — an unauthenticated
request that succeeds anyway, an authenticated request for a genuinely
disallowed role, and an authenticated request for an allowed one — are
now real, automated, machine-checked claims, proven against legacy and
proven, honestly, not yet true against `rebuild`. What `rebuild` should
actually do about the real **Operator bypass** specifically is a real,
open, deliberately-deferred design question — not resolved here, and
not silently decided by omission either.

---

**Next lesson:** the first real piece of infrastructure this slice's
own implementation needs before any of these three tests can even begin
to pass against `rebuild` — a real `Part` model, matching legacy's own
real fields, the same real starting point this project's own real
sign-in slice already used for `User`.
