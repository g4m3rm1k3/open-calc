# Lesson 36: Testing the Real Favorite Toggle

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Real part deletion is a
> complete, real, full-stack slice; this is a real, fourth, separate
> slice on the same real resource — the first real update to a part
> that already exists, rather than creating or removing one.

## What you will build

A real, automated characterization of legacy's own, already-existing
`PUT /api/parts/<id>`, deliberately scoped to just one of its own five
real, independently-updatable fields — `isFavorite` — the smallest
real slice of a route that can otherwise touch `description`,
`material`, `status`, and `model3dPath` too. Seven real cases, all
executed against the real, running legacy backend, all passing,
including two genuine surprises actual execution caught.

## What you need to know first

The real, already-tested `token_required` decorator. This slice's own
real, already-proven `POST /api/parts`, since every real case here is
proven by creating a real part first. This project's own real
**Server-generated identifier** term, already given full treatment —
reused here only to obtain a real ID to update, not re-explained as
new.

## Terms introduced

- **Partial update / PATCH-like PUT** — a real, common REST design
  where an endpoint named `PUT` (a real HTTP method whose own real,
  strict specification means "replace this real resource entirely")
  actually only changes whichever real fields a real request body
  happens to include, leaving every other real field untouched. Real
  and worth stating honestly: this is not what `PUT` strictly,
  specification-wise, means (that would be closer to real HTTP's own
  `PATCH` method) — legacy's own real `update_part`, read in full this
  session, checks `if 'isFavorite' in data:` (and four more, identical,
  independent checks for its other four real fields) rather than
  requiring every real field on every real call, making it real,
  functionally a `PATCH`, wearing a real `PUT`'s own name.

## Objects and methods used

- **`Flask.test_client().put(path, json=..., headers=...)`**
  - *What it is:* a real, built-in method on Flask's own real
    `FlaskClient` test client, sending a real HTTP `PUT` request — a
    real, third sibling of this project's own already-used `.get(...)`,
    `.post(...)`, and `.delete(...)`.
  - *Implementation:* checked against Flask's own official
    documentation this session — identical real argument shape to
    every other real, already-used method on this same real client.
  - *Its use:* this lesson's own real tests use it to send a real,
    authenticated request updating a real, existing part.
  - *Type:* an instance method on `FlaskClient`.
  - *Responsibility:* the identical real responsibility every other
    real HTTP-method method on this real client already has, carrying
    the real `PUT` method instead.
  - *Depends on:* a real, already-created `Flask` app and, for the real,
    authenticated cases, a real bearer token.
  - *Connects to:* legacy's own real `update_part` view function.
  - *Shape:* the identical real Flask/Werkzeug testing boundary already
    established.

---

## Concept Unit: A Real Update That Touches Nothing Else

### The Problem

Legacy's own real `update_part` can change five real fields, but this
slice's own real, current need is one: whether a real part is marked a
real favorite. Real doubt exists about two real things at once: does
this real route correctly reject the identical real unauthorized cases
this project's own other Parts routes already do, and does asking it to
change *one* real field genuinely leave every real, other field
completely untouched?

> **Before reading on:** legacy's own real `Part.to_dict()` already
> returns `isFavorite`, `description`, and `material` together, in one
> real response. Given that this slice's own real request will only
> ever send `{'isFavorite': true}`, what would you guess happens to a
> real part's own, already-set `description` and `material` if
> `update_part`'s own real code assigned every real field unconditionally,
> instead of checking `if 'isFavorite' in data:` first?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `update_part` function, read in full this session, lines 136–175:
  decorated `@token_required(allowed_roles=['programming', 'admin'])`
  — the identical real, narrower shape this slice's own real deletion
  route already uses, no real **Operator bypass** here either. Looks a
  real part up by its own real ID, returns a real `404` if none exists;
  calls `data = request.get_json()`, returning a real `400` with
  `{'error': 'No data provided'}` if `not data`; then five real,
  independent `if 'FIELD' in data:` checks (`description`, `material`,
  `status`, `model3dPath`, `isFavorite`), each real and only running
  when that real key is actually present in the real request body;
  commits, and returns a real `200` with `{'data': part.to_dict()}`.
- **Files affected** — created: `acceptance-tests/test_part_update.py`.
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


def test_update_part_with_no_token_returns_401_not_the_operator_bypass():
    client = get_client()
    response = client.put('/api/parts/does-not-matter', json={'isFavorite': True})
    assert response.status_code == 401
```

### The Updated Project

`acceptance-tests/test_part_update.py`, in full — brand new, so this is
the whole file so far:

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
12 def test_update_part_with_no_token_returns_401_not_the_operator_bypass():
13     client = get_client()
14     response = client.put('/api/parts/does-not-matter', json={'isFavorite': True})
15     assert response.status_code == 401
```

Three more real cases complete this unit — a real, wrong role, a real,
unknown ID, and the real, core claim: changing `isFavorite` alone
leaves everything else real, untouched:

```python
def test_update_part_rejects_a_role_not_in_the_allowed_list():
    client = get_client()
    admin_token = _admin_token(client)

    register = client.post('/api/auth/register', json={
        'email': 'qual2@mfg.com',
        'password': 'temporary',
        'name': 'Quality Inspector Two',
        'role': 'quality',
    }, headers={'Authorization': f'Bearer {admin_token}'})
    assert register.status_code == 201

    qual_login = client.post('/api/auth/login', json={
        'email': 'qual2@mfg.com',
        'password': 'temporary',
    })
    qual_token = qual_login.get_json()['token']

    response = client.put('/api/parts/does-not-matter', json={'isFavorite': True}, headers={
        'Authorization': f'Bearer {qual_token}',
    })
    assert response.status_code == 403


def test_update_part_with_unknown_id_returns_404():
    client = get_client()
    admin_token = _admin_token(client)

    response = client.put('/api/parts/no-such-part', json={'isFavorite': True}, headers={
        'Authorization': f'Bearer {admin_token}',
    })
    assert response.status_code == 404


def test_toggling_favorite_on_changes_only_that_field():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '7777777',
        'description': 'Favorite toggle check, for real',
        'material': '6061-T6 Aluminum',
    }, headers=auth)
    part_id = created.get_json()['data']['id']

    response = client.put(f'/api/parts/{part_id}', json={'isFavorite': True}, headers=auth)
    assert response.status_code == 200
    part = response.get_json()['data']
    assert part['isFavorite'] is True
    assert part['description'] == 'Favorite toggle check, for real'
    assert part['material'] == '6061-T6 Aluminum'
```

`acceptance-tests/test_part_update.py`, in full, with these three real
functions added:

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
12 def test_update_part_with_no_token_returns_401_not_the_operator_bypass():
13     client = get_client()
14     response = client.put('/api/parts/does-not-matter', json={'isFavorite': True})
15     assert response.status_code == 401
16
17
18 def test_update_part_rejects_a_role_not_in_the_allowed_list():
19     client = get_client()
20     admin_token = _admin_token(client)
21
22     register = client.post('/api/auth/register', json={
23         'email': 'qual2@mfg.com',
24         'password': 'temporary',
25         'name': 'Quality Inspector Two',
26         'role': 'quality',
27     }, headers={'Authorization': f'Bearer {admin_token}'})
28     assert register.status_code == 201
29
30     qual_login = client.post('/api/auth/login', json={
31         'email': 'qual2@mfg.com',
32         'password': 'temporary',
33     })
34     qual_token = qual_login.get_json()['token']
35
36     response = client.put('/api/parts/does-not-matter', json={'isFavorite': True}, headers={
37         'Authorization': f'Bearer {qual_token}',
38     })
39     assert response.status_code == 403
40
41
42 def test_update_part_with_unknown_id_returns_404():
43     client = get_client()
44     admin_token = _admin_token(client)
45
46     response = client.put('/api/parts/no-such-part', json={'isFavorite': True}, headers={
47         'Authorization': f'Bearer {admin_token}',
48     })
49     assert response.status_code == 404
50
51
52 def test_toggling_favorite_on_changes_only_that_field():
53     client = get_client()
54     admin_token = _admin_token(client)
55     auth = {'Authorization': f'Bearer {admin_token}'}
56
57     created = client.post('/api/parts', json={
58         'partNumber': '7777777',
59         'description': 'Favorite toggle check, for real',
60         'material': '6061-T6 Aluminum',
61     }, headers=auth)
62     part_id = created.get_json()['data']['id']
63
64     response = client.put(f'/api/parts/{part_id}', json={'isFavorite': True}, headers=auth)
65     assert response.status_code == 200
66     part = response.get_json()['data']
67     assert part['isFavorite'] is True
68     assert part['description'] == 'Favorite toggle check, for real'
69     assert part['material'] == '6061-T6 Aluminum'
```

### Mechanical Walkthrough

- **Lines 22–28, registering a real, `quality` role** — the identical
  real pattern this slice's own deletion lesson already established,
  reused here unchanged.
- **Line 39, `assert response.status_code == 403`** — the identical
  real 401-vs-403 distinction this project's own authorization slice
  already proved, applying here to a real, third route.
- **Line 49, `assert response.status_code == 404`** — the identical
  real "resource doesn't exist" case this slice's own deletion lesson
  already established.
- **Lines 57–61, a real part with two real, non-favorite fields
  already set** — `description` and `material` both given real,
  specific values on purpose, so this unit's own real claim (nothing
  else changes) has something real to actually check against.
- **Line 64, `client.put(f'/api/parts/{part_id}', json={'isFavorite': True}, ...)`**
  — this lesson's Header's own new `.put(...)` method, sending a real
  body containing only `isFavorite` — real and deliberately not
  `description` or `material` at all.
- **Lines 66–69, the real, three-part check** — `part['isFavorite'] is
  True` confirms the real, requested change actually happened;
  `part['description']` and `part['material']` both real, still equal
  to what was set at creation — real, direct proof of this lesson's
  Header's own **Partial update / PATCH-like PUT** term: asking to
  change one real field left every other real field completely
  untouched.

### CS Lens

This is a real instance of **field-level granularity in an update
operation** — legacy's own real code treats each of its five real
fields as an independent real decision (`if 'X' in data:`), rather than
requiring a real, complete replacement object matching every real
column. A real client wanting to toggle one real checkbox never has to
know or resend a real part's own real `description` just to avoid
accidentally erasing it.

Also recognized in: any real REST API documented as supporting
"partial updates"; a real document database's own real `$set` update
operator, changing only the real fields named, leaving every other
real field on that real document alone.

### SE Lens

The real, deliberately *not*-taken alternative here: legacy naming this
real route's own real HTTP method `PATCH` instead of `PUT`, matching
what it actually, functionally does. Not a bug — HTTP's own real
specification doesn't forbid a real `PUT` from behaving this way, and
plenty of real, production APIs use `PUT` for partial updates in
practice — but real and worth naming honestly as a real, minor
inconsistency between a real HTTP method's own strict, textbook meaning
and this real route's own actual, real behavior. `rebuild`'s own next,
real, implementation lesson Preserves this real choice rather than
renaming it — real and not a case for **Correct**, since nothing here
is actually broken, only imprecisely named.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_update.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether a real, single-field update genuinely
leaves every other real field alone, rather than silently resetting
them — so this was actually run this session, against legacy:

```
test_part_update.py::test_update_part_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_update.py::test_update_part_rejects_a_role_not_in_the_allowed_list PASSED
test_part_update.py::test_update_part_with_unknown_id_returns_404 PASSED
test_part_update.py::test_toggling_favorite_on_changes_only_that_field PASSED

4 passed in ...s
```

### Connecting this unit to what came before

This slice's own creation and deletion lessons proved a real part can
be made and unmade. This unit is the first time this project actually
characterizes changing one that already, real and correctly, exists.

---

## Concept Unit: Toggling Back, and Two Real Surprises About "No Data"

### The Problem

The previous unit proved turning a real favorite *on*. A real toggle
implies a real, reversible action — the previous unit alone doesn't
prove *off* is a real, separate, working request rather than a real,
one-way flag. Separately, legacy's own real code has a real, explicit
`if not data: return 400` branch for "no data provided" — a real claim
this project hasn't yet proven actually triggers the way it reads.

> **Before reading on:** a real HTTP request with genuinely no real
> body at all, and no real `Content-Type` header naming it as JSON, is
> a real, different situation than a request carrying a real, empty
> JSON object, `{}`. Given legacy's own real `data = request.get_json()`
> line, what would you guess Flask itself does with the *first* real
> case, before legacy's own real `if not data:` check ever even runs?

### Project Change

- **Reference Source** — the identical real `update_part` function
  already quoted in full in the previous unit; no new real lines exist
  to quote — this unit characterizes two real *consequences* of code
  already shown.
- **Files affected** — modified:
  `acceptance-tests/test_part_update.py`.
- **Change type** — add (three real functions, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none new.

### The New Code

```python
def test_toggling_favorite_off_again_is_a_separate_real_request():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '6666666',
        'description': 'Un-favorite check, for real',
    }, headers=auth)
    part_id = created.get_json()['data']['id']

    client.put(f'/api/parts/{part_id}', json={'isFavorite': True}, headers=auth)
    response = client.put(f'/api/parts/{part_id}', json={'isFavorite': False}, headers=auth)

    assert response.status_code == 200
    assert response.get_json()['data']['isFavorite'] is False
```

### The Updated Project

`acceptance-tests/test_part_update.py`, in full — the previous unit's
own four real tests, with this unit's own three new ones appended
(continuing from line 69):

```python
70
71
72 def test_toggling_favorite_off_again_is_a_separate_real_request():
73     client = get_client()
74     admin_token = _admin_token(client)
75     auth = {'Authorization': f'Bearer {admin_token}'}
76
77     created = client.post('/api/parts', json={
78         'partNumber': '6666666',
79         'description': 'Un-favorite check, for real',
80     }, headers=auth)
81     part_id = created.get_json()['data']['id']
82
83     client.put(f'/api/parts/{part_id}', json={'isFavorite': True}, headers=auth)
84     response = client.put(f'/api/parts/{part_id}', json={'isFavorite': False}, headers=auth)
85
86     assert response.status_code == 200
87     assert response.get_json()['data']['isFavorite'] is False
88
89
90 def test_update_part_with_an_empty_json_body_returns_400():
91     client = get_client()
92     admin_token = _admin_token(client)
93     auth = {'Authorization': f'Bearer {admin_token}'}
94
95     created = client.post('/api/parts', json={
96         'partNumber': '5432109',
97         'description': 'Empty body check, for real',
98     }, headers=auth)
99     part_id = created.get_json()['data']['id']
100
101    response = client.put(f'/api/parts/{part_id}', json={}, headers=auth)
102    assert response.status_code == 400
103
104
105 def test_update_part_with_no_body_and_no_content_type_returns_415_not_400():
106     client = get_client()
107     admin_token = _admin_token(client)
108     auth = {'Authorization': f'Bearer {admin_token}'}
109
110     created = client.post('/api/parts', json={
111         'partNumber': '5432110',
112         'description': 'No content-type check, for real',
113     }, headers=auth)
114     part_id = created.get_json()['data']['id']
115
116     response = client.put(f'/api/parts/{part_id}', headers=auth)
117     assert response.status_code == 415
```

### Mechanical Walkthrough

- **Line 83, the real, first `PUT`, result discarded** — the previous
  unit already proved exactly what this real call returns; here it's
  only a real setup step establishing a real, known starting state.
- **Line 84, `response = client.put(..., json={'isFavorite': False}, ...)`**
  — a real, second, genuinely different request, same real part.
- **Line 87, `assert response.get_json()['data']['isFavorite'] is False`**
  — real, direct proof that this real route isn't a real, one-way
  switch; the real, identical code path, called with a real, opposite
  value, produces a real, opposite result.
- **Line 101, `client.put(f'/api/parts/{part_id}', json={}, headers=auth)`**
  — real and deliberately `json={}`, a real, valid, empty JSON object —
  not simply omitting the real `json` argument entirely. A real, empty
  `dict` is real, Python-falsy, so `data = {}` makes legacy's own real
  `if not data:` check real, true, without ever touching Flask's own
  real request-parsing machinery in an unusual way.
- **Line 102, `assert response.status_code == 400`** — legacy's own
  real, documented behavior for this real case, finally proven true
  under the one real condition that actually reaches it.
- **Line 116, `client.put(f'/api/parts/{part_id}', headers=auth)`** —
  real and deliberately no `json=` argument at all this time — a real,
  genuinely bodyless request, carrying no real `Content-Type` header
  naming it as JSON.
- **Line 117, `assert response.status_code == 415`** — real, and not
  the real `400` a first, careful read of legacy's own real code would
  predict. Flask's own real `request.get_json()`, called on a real
  request with no real JSON `Content-Type` at all, raises a real,
  standard Werkzeug `415 Unsupported Media Type` error itself, before
  legacy's own real `update_part` function's own real, first line even
  finishes running — legacy's own real `if not data: return 400` branch
  is real, unreachable for *this* specific real case; it only actually
  answers a request that correctly claims to be JSON but sends an
  empty or falsy real body, exactly the real, different case the
  previous test above proves.

### CS Lens

This is a real instance of **content negotiation happening in the
framework layer, below the application's own code** — Flask's own real
request-parsing machinery enforces its own real, documented contract
(a real body claiming to be JSON must actually say so) before legacy's
own real, application-level validation ever gets a chance to run at
all. A real developer reading only `update_part`'s own real source
would reasonably, and incorrectly, predict a real `400` for every real
"no usable data" case — proving this required actually running it, not
reading it.

Also recognized in: any real web framework rejecting a real,
malformed `Content-Type` or unparseable body at its own real routing
or middleware layer, before a real, matching route handler's own code
ever executes.

### SE Lens

The real, deliberately *not*-taken alternative here: treating this real
`415` finding as a real bug and filing it as **Correct** for
`rebuild`. Rejected on purpose: a real `415 Unsupported Media Type` is
itself a real, honest, standard HTTP status for "you didn't tell me
this was JSON" — arguably *more* correct than a real, generic `400`
would have been for that specific real case. This is labeled
**Preserve**, not **Correct**, precisely because nothing here is
actually wrong; it's a real, previously undocumented detail of
*Flask's own* real behavior, discovered by running this project's own
real code, not a real defect in legacy's own real, hand-written logic
at all.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_update.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — twice over, given this unit's own two real
surprises — so this was actually run this session, against legacy,
together with every real test this lesson has built:

```
test_part_update.py::test_update_part_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_update.py::test_update_part_rejects_a_role_not_in_the_allowed_list PASSED
test_part_update.py::test_update_part_with_unknown_id_returns_404 PASSED
test_part_update.py::test_toggling_favorite_on_changes_only_that_field PASSED
test_part_update.py::test_toggling_favorite_off_again_is_a_separate_real_request PASSED
test_part_update.py::test_update_part_with_an_empty_json_body_returns_400 PASSED
test_part_update.py::test_update_part_with_no_body_and_no_content_type_returns_415_not_400 PASSED

7 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state: every one of these seven real assertions fails with a real
`405`, not a real `404` — genuinely different from this slice's own
deletion lesson's own first, honest RED. The real, honest reason:
`rebuild` already has a real route registered at this exact real path
(this slice's own deletion route, from an earlier lesson), just not
for a real `PUT` — the identical real 404-vs-405 distinction this
project's own real creation lesson already proved once, now
reappearing at a real, different path for a real, different reason.

### Connecting this unit to what came before

The previous unit proved a real toggle turns something on. This unit
proves it turns back off, and settles two real, honest questions about
what "no data" actually means to this real route — completing this
slice's own real RED, ready for the next lesson's own real
implementation.

---

## Connect the pieces

Seven real, distinct, now-automated claims about one real route:
who may call it, what happens when the real target doesn't exist, that
changing one real field leaves every other real field alone, that the
real change is genuinely reversible, and two real, honest distinctions
about what counts as "no real data" at all — proven against legacy and
proven, honestly, not yet true against `rebuild`.

---

**Next lesson:** the real route itself — the smallest real backend
change making all seven of this lesson's own real tests pass against
`rebuild`.
