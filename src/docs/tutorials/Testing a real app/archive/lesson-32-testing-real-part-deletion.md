# Lesson 32: Testing Real Part Deletion

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Real Parts creation is a
> complete, real, full-stack slice; this is a real, third, separate
> slice on the same real resource — the one that actually removes,
> or claims to remove, a real part.

## What you will build

A real, automated characterization of legacy's own, already-existing
`DELETE /api/parts/<id>` — covering a real, missing-token rejection, a
real, wrong-role rejection, a real, unknown-ID rejection, a real,
successful deletion, a real, repeated deletion of the same real part,
and a real, honestly surprising fact about where a "deleted" part
still shows up. This lesson does not touch `rebuild` at all; it proves,
honestly, what legacy's own real behavior already is, and proves the
identical real test fails honestly against `rebuild`, which has no
real route at this real path yet, at all.

## What you need to know first

The real, already-tested `token_required` decorator, and this slice's
own real, already-proven `GET /api/parts` and `POST /api/parts` —
this lesson's own real success cases are proven by creating a real
part first, then confirming its real, changed state through those same
real, existing routes, not through any new route this lesson invents.
This slice's own real listing lesson's own real **Operator bypass**
term, already given full treatment — this lesson's own first real
Concept Unit explicitly contrasts against it.

## Terms introduced

- **HTTP DELETE** — one of the real, standard HTTP methods (alongside
  `GET` and `POST`, both already used throughout this project), whose
  own real, documented meaning is "remove the real resource this real
  URL identifies." Nothing about the real HTTP specification requires
  the real resource to actually stop existing afterward — that's
  entirely up to the real server's own real implementation, which is
  exactly what this lesson's own third Concept Unit investigates.
- **Idempotent (HTTP method property)** — a real, documented property
  some real HTTP methods carry: calling the identical real request
  twice in a row produces the identical real end state as calling it
  once. `GET` is idempotent (asking twice doesn't change anything);
  `POST` is not (this project's own real `POST /api/parts` creates a
  real, second part on a real, second call with the same real body,
  unless a real, separate uniqueness check happens to intervene).
  `DELETE` is documented as idempotent — real, repeated deletion of the
  identical real resource should leave the real system in the identical
  real end state as one real deletion. This lesson's own second Concept
  Unit proves whether legacy's own real implementation actually honors
  that real, documented contract, rather than assuming it does.
- **Soft delete** — a real, deliberate implementation choice where a
  "deleted" real row is not actually removed from the real database at
  all; instead, some real column (here, `status`) is changed to mark it
  as no longer active, while the real row itself, and every real column
  on it, keeps existing. The real alternative — a **hard delete** —
  actually issues a real `DELETE FROM` statement, permanently removing
  the real row. This project's own real `Part` model file already
  states, in its own real prose, that this system "uses HARD DELETE";
  this lesson's own first Concept Unit proves that comment is wrong
  about the one real route that actually deletes a part.

## Objects and methods used

- **`Flask.test_client().delete(path, headers=...)`**
  - *What it is:* a real, built-in method on Flask's own real
    `FlaskClient` test client, sending a real HTTP `DELETE` request
    against a real, in-process Flask app — no real network socket, no
    real running server, the identical real testing boundary this
    project's own already-used `.get(...)` and `.post(...)` already
    established.
  - *Implementation:* checked against Flask's own official
    documentation this session — `delete(path, **kwargs)` accepts the
    identical real keyword arguments `.post(...)` already does
    (`headers`, `json`, `data`), returning the identical real
    `TestResponse` object with a real `.status_code` and a real
    `.get_json()`.
  - *Its use:* this lesson's own real tests use it to send a real,
    authenticated (and, in one real case, deliberately unauthenticated)
    request against a real, existing part.
  - *Type:* an instance method on `FlaskClient`.
  - *Responsibility:* constructs a real HTTP request carrying the real
    `DELETE` method, dispatches it through the real, same Flask
    routing and view-function machinery a real, deployed request would
    go through, and hands back a real, inspectable response — without
    a real network round-trip.
  - *Depends on:* a real, already-created `Flask` app (`get_client()`,
    this slice's own already-established real helper) and, for the
    real, authenticated cases, a real bearer token from this project's
    own real `/api/auth/login`.
  - *Connects to:* legacy's own real `delete_part` view function,
    exactly the same real way `.get(...)` and `.post(...)` already
    connect to `get_parts`/`get_part` and `create_part`.
  - *Shape:* the identical real Flask/Werkzeug testing boundary this
    project's own real `.get(...)` and `.post(...)` already established.

---

## Concept Unit: Four Real Ways a Deletion Attempt Resolves

### The Problem

Legacy's own real `DELETE /api/parts/<id>` already exists, already
runs, and its own real code suggests four real, distinct outcomes: no
real token at all, a real token with the wrong real role, a real,
unknown ID, and a real, successful deletion. Exactly what a real client
actually sees, in each real case, is only readable, not proven. The
real question this unit answers: what, precisely, does legacy actually
return for each — and does this real route's own real missing-token
case behave like this slice's own real listing route (this project's
own real **Operator bypass**), or like its own real creation route
(an ordinary real `401`)?

> **Before reading on:** this slice's own real listing route allows
> `'operator'` as one of its own real, allowed roles, which is exactly
> what makes its own real **Operator bypass** possible — no real token
> at all still runs the real view function, as if a real, anonymous
> caller were a real operator. Given that a real DELETE is
> irreversible-*feeling* in a way a real GET obviously isn't, what
> would you guess legacy's own real `allowed_roles` list actually
> contains for this real route — and does it seem more likely to match
> the real listing route's own real, permissive list, or the real
> creation route's own real, narrower one?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `delete_part` function, read in full this session, lines 178–200:
  decorated `@token_required(allowed_roles=['programming', 'admin'])`
  — the identical real, narrower shape this slice's own real creation
  route already uses, not the real listing route's own real, more
  permissive one: `'operator'` is not among these real, allowed roles,
  so a real, missing token here is a real, ordinary `401`, not this
  project's own real **Operator bypass**. Looks a real part up by its
  real ID, returns a real `404` if none exists; otherwise sets that
  real row's own real `status` column to `'archived'`, commits, and
  returns a real `200` with `{'message': f'Part {part_number}
  archived'}` — real and never a real `db.session.delete(...)`, the
  real, physical row-removal call this project's own real `Part` model
  file's own real, prose comment claims this system uses.
- **Files affected** — created: `acceptance-tests/test_part_deletion.py`.
- **Change type** — add (new file).
- **Location** — directly inside the existing real `acceptance-tests/`
  folder.
- **Dependencies** — none beyond this project's own shared
  acceptance-test harness.

### The New Code

```python
from target import get_client


def _admin_token(client):
    login = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'admin',
    })
    return login.get_json()['token']


def test_delete_part_with_no_token_returns_401_not_the_operator_bypass():
    client = get_client()
    response = client.delete('/api/parts/does-not-matter')
    assert response.status_code == 401
```

### The Updated Project

`acceptance-tests/test_part_deletion.py`, in full — brand new, so this
is the whole file so far:

```python
1  from target import get_client
2
3
4  def _admin_token(client):
5      login = client.post('/api/auth/login', json={
6          'email': 'admin@mfg.com',
7          'password': 'admin',
8      })
9      return login.get_json()['token']
10
11
12 def test_delete_part_with_no_token_returns_401_not_the_operator_bypass():
13     client = get_client()
14     response = client.delete('/api/parts/does-not-matter')
15     assert response.status_code == 401
```

### Mechanical Walkthrough

- **Lines 4–9, `_admin_token(client)`** — a real, small helper, factored
  out because every real, authenticated case below needs the identical
  real three lines to obtain one: a real, plain Python function, not a
  pytest fixture — this project hasn't introduced real pytest fixtures
  yet, and one real, private helper function is the smaller, real
  concept for what this file alone needs right now.
- **Line 14, `client.delete('/api/parts/does-not-matter')`** — this
  lesson's Header's own new **`Flask.test_client().delete(...)`**
  method, called with no real `headers` argument at all — deliberately,
  simulating a real, completely unauthenticated request. The real path
  itself, `'/api/parts/does-not-matter'`, is deliberately nonsensical —
  this real case is testing what happens *before* legacy's own real
  code ever looks up a real part by this real ID at all, so the real ID
  itself never matters here.
- **Line 15, `assert response.status_code == 401`** — legacy's own real
  `token_required(allowed_roles=['programming', 'admin'])` decorator,
  already given full treatment in an earlier lesson: with no real token
  present, and `'operator'` genuinely absent from this real route's own
  real `allowed_roles`, the real decorator returns a real,
  straightforward `401` — confirming, for real, this lesson's own
  opening Socratic guess: this real route behaves like creation, not
  like listing.

Three more real cases complete this unit — a real, wrong role, a real,
unknown ID, and a real, successful deletion:

```python
def test_delete_part_rejects_a_role_not_in_the_allowed_list():
    client = get_client()
    admin_token = _admin_token(client)

    register = client.post('/api/auth/register', json={
        'email': 'qual@mfg.com',
        'password': 'temporary',
        'name': 'Quality Inspector',
        'role': 'quality',
    }, headers={'Authorization': f'Bearer {admin_token}'})
    assert register.status_code == 201

    qual_login = client.post('/api/auth/login', json={
        'email': 'qual@mfg.com',
        'password': 'temporary',
    })
    qual_token = qual_login.get_json()['token']

    response = client.delete('/api/parts/does-not-matter', headers={
        'Authorization': f'Bearer {qual_token}',
    })
    assert response.status_code == 403


def test_delete_part_with_unknown_id_returns_404():
    client = get_client()
    admin_token = _admin_token(client)

    response = client.delete('/api/parts/no-such-part', headers={
        'Authorization': f'Bearer {admin_token}',
    })
    assert response.status_code == 404


def test_delete_part_archives_instead_of_removing_the_row():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '9999999',
        'description': 'Part being deleted, for real',
    }, headers=auth)
    part_id = created.get_json()['data']['id']

    response = client.delete(f'/api/parts/{part_id}', headers=auth)
    assert response.status_code == 200
    assert response.get_json() == {'message': 'Part 9999999 archived'}

    still_there = client.get(f'/api/parts/{part_id}', headers=auth)
    assert still_there.status_code == 200
    assert still_there.get_json()['data']['status'] == 'archived'
```

`acceptance-tests/test_part_deletion.py`, in full, with these three
real functions added:

```python
1  from target import get_client
2
3
4  def _admin_token(client):
5      login = client.post('/api/auth/login', json={
6          'email': 'admin@mfg.com',
7          'password': 'admin',
8      })
9      return login.get_json()['token']
10
11
12 def test_delete_part_with_no_token_returns_401_not_the_operator_bypass():
13     client = get_client()
14     response = client.delete('/api/parts/does-not-matter')
15     assert response.status_code == 401
16
17
18 def test_delete_part_rejects_a_role_not_in_the_allowed_list():
19     client = get_client()
20     admin_token = _admin_token(client)
21
22     register = client.post('/api/auth/register', json={
23         'email': 'qual@mfg.com',
24         'password': 'temporary',
25         'name': 'Quality Inspector',
26         'role': 'quality',
27     }, headers={'Authorization': f'Bearer {admin_token}'})
28     assert register.status_code == 201
29
30     qual_login = client.post('/api/auth/login', json={
31         'email': 'qual@mfg.com',
32         'password': 'temporary',
33     })
34     qual_token = qual_login.get_json()['token']
35
36     response = client.delete('/api/parts/does-not-matter', headers={
37         'Authorization': f'Bearer {qual_token}',
38     })
39     assert response.status_code == 403
40
41
42 def test_delete_part_with_unknown_id_returns_404():
43     client = get_client()
44     admin_token = _admin_token(client)
45
46     response = client.delete('/api/parts/no-such-part', headers={
47         'Authorization': f'Bearer {admin_token}',
48     })
49     assert response.status_code == 404
50
51
52 def test_delete_part_archives_instead_of_removing_the_row():
53     client = get_client()
54     admin_token = _admin_token(client)
55     auth = {'Authorization': f'Bearer {admin_token}'}
56
57     created = client.post('/api/parts', json={
58         'partNumber': '9999999',
59         'description': 'Part being deleted, for real',
60     }, headers=auth)
61     part_id = created.get_json()['data']['id']
62
63     response = client.delete(f'/api/parts/{part_id}', headers=auth)
64     assert response.status_code == 200
65     assert response.get_json() == {'message': 'Part 9999999 archived'}
66
67     still_there = client.get(f'/api/parts/{part_id}', headers=auth)
68     assert still_there.status_code == 200
69     assert still_there.get_json()['data']['status'] == 'archived'
```

### Mechanical Walkthrough (continued)

- **Lines 22–28, registering a real, `quality` role** — reuses this
  project's own, already-proven real `/api/auth/register` route
  directly, the identical real pattern this slice's own listing
  lesson's own real role-rejection case already established. `quality`
  is real and genuinely valid for some other real routes (this slice's
  own real listing route allows it) — deliberately chosen so this real
  case proves a real *role*-based rejection, not a role that doesn't
  exist at all.
- **Line 39, `assert response.status_code == 403`** — legacy's own
  real, documented behavior once a real, valid token names a real role
  outside `allowed_roles`: `token_required` returns a real `403`, real
  and genuinely different from the previous test's own real `401` —
  this real distinction (no proof of identity at all, versus a real,
  proven identity that's simply not allowed) is this project's own
  real authorization slice's own, already-proven contract, reused here
  unchanged.
- **Line 49, `assert response.status_code == 404`** — legacy's own
  real `if not part: return jsonify({'error': 'Part not found'}), 404`
  — a real, straightforward "this real resource doesn't exist" case,
  genuinely different from the previous two real cases (both about
  *who* is asking, not *what* they're asking about).
- **Lines 57–61, a real, fresh part, created to be deleted** — reuses
  this slice's own real, already-proven `POST /api/parts` directly,
  the identical real pattern this slice's own creation lesson already
  established.
- **Line 63, the real deletion itself** — this lesson's Header's own
  new `.delete(...)` method, this time with a real, valid admin token.
- **Line 65, `assert response.get_json() == {'message': 'Part 9999999 archived'}`**
  — legacy's own real, literal response body: the word **archived**,
  not **deleted** — the first real, textual hint, straight from
  legacy's own real API, that nothing was actually removed.
- **Lines 67–69, confirming the real row still exists** — reuses this
  slice's own real, already-proven `GET /api/parts/<id>` directly:
  `still_there.status_code == 200`, not a real `404` — real, direct
  proof that this lesson's Header's own **Soft delete** term names
  what actually happened here, not this project's own real `Part`
  model file's own real, incorrect comment claiming "HARD DELETE."
  `still_there.get_json()['data']['status'] == 'archived'` confirms
  precisely *what* changed: one real column, on the identical real row.

### CS Lens

This is a real instance of **tombstoning** — marking a real record as
logically gone while its own real, physical storage stays exactly
where it was, rather than physically reclaiming that real storage
immediately. The real word comes from real distributed databases and
version-control systems, where a real, immediate physical removal would
be actively harmful (a real deleted key in a real distributed store
needs to keep existing, marked as deleted, long enough for that real
deletion to actually propagate to every real replica before the real
space is reclaimed) — legacy's own real motive here is different (real
auditability, discussed in the SE Lens below) but the real mechanical
shape — mark, don't erase — is the identical real idea.

Also recognized in: an email client's real "Trash" folder (a real
message isn't gone, only real, differently categorized, until a real,
separate "empty trash" action); a real filesystem's recycle bin; a real
git branch deleted with `git branch -d`, whose real commits stay real
and reachable, and real, fully recoverable, until real Git's own
garbage collector eventually runs.

### SE Lens

The real, deliberately *not*-taken alternative here: an actual real
`db.session.delete(part)`, physically removing the real row — a real
**hard delete**. Legacy's own real choice, soft-deleting instead,
buys real auditability (a real, later investigation into "what
happened to this real part" still finds a real row with a real,
complete history) and real referential safety (any real, other table
holding a real foreign key pointing at this real part's own real ID —
this project's own real `CAMFile` model already does — never becomes a
real, dangling reference overnight). The real, honest cost, carried by
legacy right now: this real route's own real name, `delete_part`, and
its own real HTTP method, `DELETE`, both real, actively mislead a real
reader about what actually happens — and this project's own real
`Part` model file's own real, prose comment claims the *opposite* of
what this real route actually does, a real, existing, undiscovered
inconsistency between real, hand-written documentation and real,
running code, found only by this lesson's own real execution, not by
reading either one alone.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_deletion.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real route's own real missing-
token case matches the real listing route's own real bypass, or the
real creation route's own real, ordinary `401`, and whether a real,
soft-deleted row genuinely survives a real, follow-up `GET` — so this
was actually run this session, against legacy:

```
test_part_deletion.py::test_delete_part_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_deletion.py::test_delete_part_rejects_a_role_not_in_the_allowed_list PASSED
test_part_deletion.py::test_delete_part_with_unknown_id_returns_404 PASSED
test_part_deletion.py::test_delete_part_archives_instead_of_removing_the_row PASSED

4 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state — and genuinely the plainest RED this project has produced yet:
every one of these four real assertions fails with a real `404`,
because `rebuild` doesn't merely handle this real path wrong — it has
no real route registered at this real path *at all*, for any real HTTP
method:

```
assert 404 == 401   # no-token case
assert 404 == 403   # wrong-role case
assert response.status_code == 404  # unknown-id case — passes; both real and rebuild agree, by coincidence
assert 404 == 200   # success case
```

The real, unknown-ID case is the one real exception worth naming
honestly: it happens to pass against `rebuild` too, right now, but for
the wrong real reason — `rebuild` returns a real `404` because *no
route matches at all*, not because a real route ran and correctly
decided a real part was missing. A real, passing assertion for a real,
wrong reason is not the same real thing as a real, working feature; the
next lesson's own real route is what makes this real case pass for the
real, correct reason instead.

### Connecting this unit to what came before

This slice's own listing and creation lessons proved what a real `GET`
and a real `POST` do. This unit is the first time this project actually
characterizes a real `DELETE` — and the first time a real route's own
real name turns out not to describe what it actually does.

---

## Concept Unit: Idempotent by Design, or by Accident?

### The Problem

This lesson's Header's own new **Idempotent** term makes a real,
specific, testable claim about `DELETE`: calling it twice, on the
identical real resource, should leave the real system in the identical
real end state as calling it once. A real **hard delete** would
obviously violate this the moment it's tried a second time — the real
row is already gone, so a real, second attempt has nothing left to
find. Legacy's own real implementation is a real **soft delete**
instead. The real question this unit answers: does that real
implementation choice actually deliver on `DELETE`'s own real,
documented promise, or does it just happen to avoid the real, most
obvious way of breaking it?

> **Before reading on:** the previous unit's own real
> `test_delete_part_with_unknown_id_returns_404` proves a real,
> *nonexistent* part produces a real `404`. If a real hard delete were
> used instead of legacy's own real soft delete, what real HTTP status
> would a real, *second* `DELETE` on the *same* real part produce —
> and would that make `DELETE`, as legacy would then implement it, a
> real, idempotent method or not?

### Project Change

- **Reference Source** — the identical real `delete_part` function
  already quoted in full in the previous unit; no new real lines exist
  to quote — this unit characterizes a real *consequence* of code
  already shown, not new code.
- **Files affected** — modified:
  `acceptance-tests/test_part_deletion.py`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none new.

### The New Code

```python
def test_deleting_an_already_archived_part_is_idempotent():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '5555555',
        'description': 'Idempotency check, for real',
    }, headers=auth)
    part_id = created.get_json()['data']['id']

    first = client.delete(f'/api/parts/{part_id}', headers=auth)
    assert first.status_code == 200

    second = client.delete(f'/api/parts/{part_id}', headers=auth)
    assert second.status_code == 200
    assert second.get_json() == {'message': 'Part 5555555 archived'}
```

### The Updated Project

`acceptance-tests/test_part_deletion.py`, in full — the previous
unit's own four real tests, with this unit's own new one appended
(line numbers continue from the previous unit's own count of 69):

```python
70
71
72 def test_deleting_an_already_archived_part_is_idempotent():
73     client = get_client()
74     admin_token = _admin_token(client)
75     auth = {'Authorization': f'Bearer {admin_token}'}
76
77     created = client.post('/api/parts', json={
78         'partNumber': '5555555',
79         'description': 'Idempotency check, for real',
80     }, headers=auth)
81     part_id = created.get_json()['data']['id']
82
83     first = client.delete(f'/api/parts/{part_id}', headers=auth)
84     assert first.status_code == 200
85
86     second = client.delete(f'/api/parts/{part_id}', headers=auth)
87     assert second.status_code == 200
88     assert second.get_json() == {'message': 'Part 5555555 archived'}
```

### Mechanical Walkthrough

- **Line 83, `first = client.delete(...)`** — the identical real
  `.delete(...)` call already given full treatment; a real, first,
  ordinary deletion, exactly like the previous unit's own real success
  case.
- **Line 84, `assert first.status_code == 200`** — confirms the real
  starting point: this real part genuinely exists and genuinely gets
  archived once, before this unit's own real question — what happens
  *again* — is even asked.
- **Line 86, `second = client.delete(...)`** — the identical real
  request, the identical real part ID, sent a real, second time. Real
  and worth stating plainly: legacy's own real `delete_part`, quoted in
  full in the previous unit, contains no real, special-cased check for
  "already archived" anywhere in its own real body — `part.status =
  'archived'` runs unconditionally, real and exactly the same on a real
  row whose own real `status` is already `'archived'`.
- **Line 87, `assert second.status_code == 200`** — real, not a real
  `404`. This real result is not a coincidence; it's a direct, real
  consequence of the previous unit's own real finding: `Part.query.get`
  still real, genuinely finds this real row (soft delete never removed
  it), so `delete_part`'s own real `if not part` check never real, true
  a second time either.
- **Line 88, `assert second.get_json() == {'message': 'Part 5555555 archived'}`**
  — the identical real response body as the real, first call — real,
  further proof of a genuinely identical real end state, not merely a
  matching real status code.

### CS Lens

This is a real instance of an **idempotent operation achieved as a
side effect of representation, not by deliberate design for
idempotency itself** — legacy's own real code never checks "is this
already archived?" before archiving again; it doesn't need to, because
a real assignment (`part.status = 'archived'`) is itself a real,
naturally idempotent operation — setting a real field to the identical
real value twice leaves the identical real result, the same real way
`x = 5` run twice leaves `x` real, equal to `5`, not `10`. A real, hard
delete's own natural operation — `DELETE FROM parts WHERE id = ...` —
is *not* naturally idempotent in the same way at the *application*
layer, because a real, second attempt finds nothing real left to act
on, which is exactly why this project's own earlier Socratic prompt
above expected a real `404` from that real alternative.

Also recognized in: `PUT` in a real REST API (documented idempotent for
the identical real reason — "set this real resource to exactly this
real state" is naturally repeatable); a real thermostat set to `72`
degrees twice in a row; a real distributed system's own real retry
logic, which depends on a real request being safely repeatable without
knowing, in advance, whether the real, first attempt actually succeeded
or the real response merely got lost in transit.

### SE Lens

The real, deliberately *not*-taken alternative here: legacy's own real
code could have added an explicit real guard (`if part.status ==
'archived': return jsonify({'error': 'Part already archived'}), 409`)
to reject a real, repeated deletion outright. Rejected, real and
implicitly, by simply never having been written — and this unit's own
real finding is that the *absence* of that real guard is actually the
real, better outcome here: an explicit real `409` on a real, repeated
`DELETE` would *break* the real, documented idempotency contract this
lesson's Header's own term describes, for no real benefit — a real
caller retrying a real, uncertain network request (the exact real
scenario `DELETE`'s own idempotency guarantee exists to support) would
start receiving a real, spurious error on a real, second, harmless
attempt. Legacy's own real simplicity here — no real special case at
all — happens to be the real, more correct design, not merely the
laziest one.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_deletion.py -v
```

### Run it, per the Verification Rule

Real doubt existed here too — whether legacy's own real code actually
honors `DELETE`'s own documented idempotency, or merely happens to
avoid crashing — so this was actually run this session, against
legacy, together with the previous unit's own four real tests:

```
test_part_deletion.py::test_delete_part_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_deletion.py::test_delete_part_rejects_a_role_not_in_the_allowed_list PASSED
test_part_deletion.py::test_delete_part_with_unknown_id_returns_404 PASSED
test_part_deletion.py::test_delete_part_archives_instead_of_removing_the_row PASSED
test_part_deletion.py::test_deleting_an_already_archived_part_is_idempotent PASSED

5 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state: this real test fails too, at its own real first assertion
(`assert first.status_code == 200`), with the identical real `404` —
the identical real reason every other real case in this lesson fails
against `rebuild` right now: no real route exists at this real path at
all yet.

### Connecting this unit to what came before

The previous unit proved *what* legacy's own real `DELETE` does once.
This unit proves it keeps doing the identical real thing, real and
correctly, no matter how many real times it's asked.

---

## Concept Unit: Soft Delete Doesn't Mean Hidden

### The Problem

The previous two units both proved a real, soft-deleted part's own
real row survives, findable by its own real, specific ID. Neither one
yet answers a real, different, arguably more important question: does
this project's own real, *plain* `GET /api/parts` — the one an actual
real UI would call to show a real list — still show a real, "deleted"
part to a real user, right alongside every other real, active one?

> **Before reading on:** this slice's own listing lesson already
> proved legacy's own real `GET /api/parts` accepts an optional real
> `status` query parameter, letting a real caller filter by a real,
> specific status. Given that this lesson's own new real part gets a
> real `status` of `'archived'` rather than being real, physically
> removed, what would you guess happens if a real caller asks for the
> real, *plain* list — no real `status` parameter at all?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `get_parts` function, already quoted in full in this slice's own
  listing lesson: builds `query = Part.query`, applies a real `status`
  filter only `if status:` (a real, optional query parameter is
  present), and otherwise runs `query.order_by(Part.part_number).all()`
  completely unfiltered — no real, default exclusion of a real
  `'archived'` status appears anywhere in its own real body.
- **Files affected** — modified:
  `acceptance-tests/test_part_deletion.py`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none new.

### The New Code

```python
def test_an_archived_part_still_appears_in_the_default_list():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '8888888',
        'description': 'Also being deleted, for real',
    }, headers=auth)
    part_id = created.get_json()['data']['id']
    client.delete(f'/api/parts/{part_id}', headers=auth)

    listing = client.get('/api/parts', headers=auth)
    ids_in_list = [part['id'] for part in listing.get_json()['data']]
    assert part_id in ids_in_list
```

### The Updated Project

`acceptance-tests/test_part_deletion.py`, in full — the previous two
units' own five real tests, with this unit's own new one appended
(continuing from line 88):

```python
89
90
91 def test_an_archived_part_still_appears_in_the_default_list():
92     client = get_client()
93     admin_token = _admin_token(client)
94     auth = {'Authorization': f'Bearer {admin_token}'}
95
96     created = client.post('/api/parts', json={
97         'partNumber': '8888888',
98         'description': 'Also being deleted, for real',
99     }, headers=auth)
100    part_id = created.get_json()['data']['id']
101    client.delete(f'/api/parts/{part_id}', headers=auth)
102
103    listing = client.get('/api/parts', headers=auth)
104    ids_in_list = [part['id'] for part in listing.get_json()['data']]
105    assert part_id in ids_in_list
```

### Mechanical Walkthrough

- **Lines 96–100, a real, fresh part** — the identical real creation
  pattern already established, giving this unit its own real,
  independent part to delete, so it doesn't depend on real state either
  earlier unit happened to leave behind.
- **Line 101, `client.delete(...)`, real result discarded** — this
  unit already proved, in the first Concept Unit above, exactly what
  this real call returns; here it's only a real setup step for the
  real question this unit actually asks, so its own real return value
  is deliberately not captured.
- **Line 103, `listing = client.get('/api/parts', headers=auth)`** —
  the identical real, already-proven listing route, called with no
  real `status` parameter at all — deliberately the real, plainest,
  most common real way a real client would ask "show me the parts."
- **Line 104, `ids_in_list = [part['id'] for part in listing.get_json()['data']]`**
  — a real Python list comprehension, real and already used in earlier
  lessons: iterates the real `data` array the real response body
  carries, pulling out just each real part's own real `id`.
- **Line 105, `assert part_id in ids_in_list`** — the real, honest
  finding this unit exists to prove: legacy's own real, "deleted" part
  is real, still there, in the real, exact same list a real, active
  part appears in, with nothing distinguishing it beside its own real
  `status` field — a real UI that only reads a part's real `partNumber`
  and `description` (this project's own real `PartsList`, right now,
  reads exactly those two) would show a real, "deleted" part
  identically to a real, active one.

### CS Lens

This is a real instance of the gap between a **logical delete** and a
**visible delete** — this lesson's Header's own **Soft delete** term
names the real, storage-layer mechanism (the real row survives); this
unit proves that mechanism, on its own, says nothing at all about
whether any real, calling layer actually *filters* on it. The real
`status` column genuinely exists and genuinely gets set correctly; the
real gap is that nothing downstream is real, obligated to read it.

Also recognized in: a real search index that marks a document
"deleted" in its own real metadata but keeps serving it in real
results until a real, separate reindex job runs; a real content-
moderation system whose own real "hidden" flag does nothing until every
real display path actually checks it.

### SE Lens

The real, honest, open question this unit surfaces, deliberately not
resolved here: should a real "deleted" part actually disappear from
the real, default list a real user sees? Legacy's own real, current
answer is genuinely no — and this project cannot yet honestly label
that a real bug (**Correct**) or a real, considered choice
(**Preserve**) without first checking whether any real, existing
legacy UI *itself* passes `status` explicitly when rendering its own
real, default parts view, which this lesson does not investigate. This
is deliberately left as a real, open decision for this slice's own next,
*implementation* lesson to make explicitly, with a real, stated reason
either way — not silently inherited by default, the exact real trap
this project's own real, three-way **Preserve / Correct / Deliberately
changed** labeling system exists to prevent.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_deletion.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether legacy's own real listing route
actually excludes a real, archived part by default, or only appears to
because none has existed in any prior lesson's own real test data — so
this was actually run this session, against legacy, together with every
real test this lesson has built:

```
test_part_deletion.py::test_delete_part_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_deletion.py::test_delete_part_rejects_a_role_not_in_the_allowed_list PASSED
test_part_deletion.py::test_delete_part_with_unknown_id_returns_404 PASSED
test_part_deletion.py::test_delete_part_archives_instead_of_removing_the_row PASSED
test_part_deletion.py::test_deleting_an_already_archived_part_is_idempotent PASSED
test_part_deletion.py::test_an_archived_part_still_appears_in_the_default_list PASSED

6 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state: this real test passes there too, right now — but, honestly, for
the identical wrong real reason the first unit's own unknown-ID case
did. `rebuild`'s own real `DELETE` call above does nothing at all (no
real route matches), so the real part this test creates is, real and
trivially, still real and present in the real list afterward — a real,
passing assertion proving nothing yet about whether `rebuild`'s own,
still-unbuilt real route will honestly reproduce this same real
behavior once it exists.

### Connecting this unit to what came before

The previous two units proved a "deleted" part survives, findable by
its own real, specific ID. This unit proves it survives somewhere a
real user would actually be looking, without needing to know that
specific ID at all — the real, most concrete form this lesson's own
real finding takes.

---

## Connect the pieces

Six real, distinct, now-automated claims about one real route: who may
call it, what happens when the real target doesn't exist, what
actually changes on a real, successful call, what happens on a real,
repeated call, and where the real result is still visible afterward.
All six are proven against legacy and proven, honestly, not yet true
against `rebuild` — some for the real, right reason (no route exists),
two by real coincidence (a `404` that means "not found" on legacy and
"no route at all" on `rebuild`; a list that still shows a part on
`rebuild` because nothing happened to it at all).

---

**Next lesson:** the real route itself — the smallest real backend
change making all six of this lesson's own real tests pass against
`rebuild`, for the real, correct reasons instead of by real
coincidence.
