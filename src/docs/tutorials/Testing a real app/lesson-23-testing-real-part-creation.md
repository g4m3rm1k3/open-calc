# Lesson 23: Testing Real Part Creation

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Real Parts listing is a
> complete, real, full-stack slice; this is a real, second, deeper
> slice on top of it — the one that actually makes non-empty data
> possible for real, not only through a frontend test's own fake
> `fetch`.

## What you will build

A real, automated characterization of legacy's own, already-existing
`POST /api/parts` — covering a real, missing-field rejection, a real
success producing a real, machine-generated ID, and a real, duplicate
part number's own real rejection. This lesson does not touch `rebuild`
at all; it proves, honestly, what legacy's own real behavior already
is, and proves the identical real test fails honestly against
`rebuild`, which has no way to create a real part yet.

## What you need to know first

The real, already-tested `token_required` decorator, and the real
`Part` model. This slice's own real listing lesson, and its real,
already-proven `GET /api/parts` — this lesson's own real success case
proves a real part actually appears there afterward.

## Terms introduced

- **Server-generated identifier** — a real, standard pattern: a real
  client never supplies a new resource's own real, unique ID directly;
  the real server generates one, guaranteed real and unique by
  construction, and hands it back in the real response. Legacy's own
  real `create_part` does this — a real client sends a real
  `partNumber` (a real, human-facing designation) and a real
  `description`, never a real `id`; the real server builds a real,
  random one.

## Objects and methods used

- **`Flask.test_client().post(path, json=..., headers=...)`**
  - *What it is:* this project's own real, already-used `.post(...)`
    method, reused unchanged for a genuinely different real resource.
  - *Implementation:* checked against Flask's own official
    documentation this session — identical real behavior already given
    full treatment; no new real argument shape appears in this lesson.
  - *Its use:* this lesson's own real tests use it to send a real,
    authenticated request creating a real part.
  - *Type:* the identical real method already given full treatment.
  - *Responsibility:* the identical real responsibility already
    established.
  - *Depends on:* the identical real dependencies already established.
  - *Connects to:* legacy's own real `create_part` view function.
  - *Shape:* the identical real Flask/Werkzeug testing boundary already
    established.

---

## Concept Unit: Three Real Ways a Creation Attempt Resolves

### The Problem

Legacy's own real `POST /api/parts` already exists, already runs, and
its own real code suggests three real, distinct outcomes: a real,
missing field, a real, successful creation, and a real, duplicate part
number. Exactly what a real client actually sees, in each real case,
is only readable, not proven. The real question this unit answers: what,
precisely, does legacy actually return for each?

> **Before reading on:** this project's own real `Part` model already
> has a real, required `part_number`, unique across every real row.
> Given a real client could send a real `partNumber` that already
> belongs to a real, existing part, what real, honest HTTP status code
> would you guess is the correct one for "this specific real resource
> already exists" — genuinely different from both a real `400`
> (malformed request) and a real `401`/`403` (identity/permission)?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `create_part` function, read in full this session: requires a real
  `partNormalize`/`description` pair, returns a real `400` with `{'error':
  f'Missing required field: {field}'}` if either is absent; checks for
  a real, existing part sharing the given real `partNumber`, returning
  a real `409` with `{'error': f'Part number {partNumber} already
  exists'}` if so; otherwise generates a real, random ID
  (`f'P-{uuid.uuid4().hex[:8].upper()}'`), builds a real `Part`, and
  returns a real `201` with `{'data': part.to_dict()}`. Decorated
  `@token_required(allowed_roles=['programming', 'admin'])` — real,
  deliberately narrower than this slice's own list route: `'operator'`
  is not among these real, allowed roles, so this route's own real,
  missing-token case is a real, ordinary `401`, not this project's own
  real **Operator bypass**.
- **Files affected** — created: `acceptance-tests/test_part_creation.py`.
- **Change type** — add (new file).
- **Location** — directly inside the existing real `acceptance-tests/`
  folder.
- **Dependencies** — none beyond this project's own shared
  acceptance-test harness.

### The New Code

```python
from target import get_client


def test_create_part_requires_a_description():
    client = get_client()

    login = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'admin',
    })
    admin_token = login.get_json()['token']

    response = client.post('/api/parts', json={
        'partNumber': '1234567',
    }, headers={'Authorization': f'Bearer {admin_token}'})

    assert response.status_code == 400


def test_create_part_succeeds_with_a_server_generated_id():
    client = get_client()

    login = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'admin',
    })
    admin_token = login.get_json()['token']

    response = client.post('/api/parts', json={
        'partNumber': '1234567',
        'description': 'Landing Gear Bracket',
        'material': '6061-T6 Aluminum',
    }, headers={'Authorization': f'Bearer {admin_token}'})

    assert response.status_code == 201
    part = response.get_json()['data']
    assert part['id'].startswith('P-')
    assert part['partNumber'] == '1234567'
    assert part['description'] == 'Landing Gear Bracket'
    assert part['material'] == '6061-T6 Aluminum'

    listing = client.get('/api/parts', headers={
        'Authorization': f'Bearer {admin_token}',
    })
    assert listing.get_json()['total'] == 1


def test_create_part_rejects_a_duplicate_part_number():
    client = get_client()

    login = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'admin',
    })
    admin_token = login.get_json()['token']

    first = client.post('/api/parts', json={
        'partNumber': '1234567',
        'description': 'Landing Gear Bracket',
    }, headers={'Authorization': f'Bearer {admin_token}'})
    assert first.status_code == 201

    second = client.post('/api/parts', json={
        'partNumber': '1234567',
        'description': 'A different, real part',
    }, headers={'Authorization': f'Bearer {admin_token}'})
    assert second.status_code == 409
```

### The Updated Project

`acceptance-tests/test_part_creation.py`, in full — brand new, so this
is the whole file:

```python
1  from target import get_client
2
3
4  def test_create_part_requires_a_description():
5      client = get_client()
6
7      login = client.post('/api/auth/login', json={
8          'email': 'admin@mfg.com',
9          'password': 'admin',
10     })
11     admin_token = login.get_json()['token']
12
13     response = client.post('/api/parts', json={
14         'partNumber': '1234567',
15     }, headers={'Authorization': f'Bearer {admin_token}'})
16
17     assert response.status_code == 400
18
19
20 def test_create_part_succeeds_with_a_server_generated_id():
21     client = get_client()
22
23     login = client.post('/api/auth/login', json={
24         'email': 'admin@mfg.com',
25         'password': 'admin',
26     })
27     admin_token = login.get_json()['token']
28
29     response = client.post('/api/parts', json={
30         'partNumber': '1234567',
31         'description': 'Landing Gear Bracket',
32         'material': '6061-T6 Aluminum',
33     }, headers={'Authorization': f'Bearer {admin_token}'})
34
35     assert response.status_code == 201
36     part = response.get_json()['data']
37     assert part['id'].startswith('P-')
38     assert part['partNumber'] == '1234567'
39     assert part['description'] == 'Landing Gear Bracket'
40     assert part['material'] == '6061-T6 Aluminum'
41
42     listing = client.get('/api/parts', headers={
43         'Authorization': f'Bearer {admin_token}',
44     })
45     assert listing.get_json()['total'] == 1
46
47
48 def test_create_part_rejects_a_duplicate_part_number():
49     client = get_client()
50
51     login = client.post('/api/auth/login', json={
52         'email': 'admin@mfg.com',
53         'password': 'admin',
54     })
55     admin_token = login.get_json()['token']
56
57     first = client.post('/api/parts', json={
58         'partNumber': '1234567',
59         'description': 'Landing Gear Bracket',
60     }, headers={'Authorization': f'Bearer {admin_token}'})
61     assert first.status_code == 201
62
63     second = client.post('/api/parts', json={
64         'partNumber': '1234567',
65         'description': 'A different, real part',
66     }, headers={'Authorization': f'Bearer {admin_token}'})
67     assert second.status_code == 409
```

### Mechanical Walkthrough

- **Lines 7–11, a real admin sign-in** — reuses this project's own,
  already-proven real login route directly, the identical real pattern
  this slice's own testing lesson already established.
- **Lines 13–15, the real, incomplete request** — a real `partNumber`,
  deliberately no real `description` at all.
- **Line 17, `assert response.status_code == 400`** — legacy's own real,
  documented behavior for a real, missing required field.
- **Lines 29–33, the real, complete request** — a real `partNumber`,
  `description`, and `material`, matching legacy's own real, documented
  request shape exactly.
- **Lines 36–40, checking the real, returned part** — this lesson's
  Header's own **Server-generated identifier** term, proven rather than
  assumed: `part['id'].startswith('P-')`, a real, structural check —
  the exact real bytes after the real, literal `'P-'` prefix are
  genuinely random every real run, so this test checks the real *shape*
  legacy's own real ID-generation guarantees, not one, specific, real
  value; the remaining three real assertions confirm the real request's
  own real values came back unchanged.
- **Lines 42–45, confirming the real part is actually listed** —
  reuses this slice's own real, already-proven `GET /api/parts`
  directly: `listing.get_json()['total'] == 1` — real, direct proof
  that a real creation genuinely persists, observable through a
  completely separate real route, not merely inferred from the real
  create response alone.
- **Lines 57–61, a real, first, successful creation** — establishes a
  real, known part number to collide with.
- **Lines 63–67, the real, second, colliding request** — the identical
  real `partNumber`, a genuinely different real `description`; `assert
  second.status_code == 409` — legacy's own real, documented status for
  "this specific real resource already exists," genuinely different
  from a real `400` (the first test's own case: the request itself was
  malformed) and from a real `401`/`403` (an identity or permission
  problem, neither of which applies here — this real admin is
  completely, correctly authorized).

### CS Lens

This is a real instance of **idempotency keys and natural uniqueness
constraints** — a real, database-enforced `unique=True` constraint
(this slice's own `Part.part_number` column, already built) is what
actually makes a real `409` possible to detect at all: the real
database itself refuses two real rows sharing a real `part_number`,
and legacy's own real route checks for that real condition explicitly,
before ever attempting a real write, to return a real, meaningful
status instead of a real, generic database error.

Also recognized in: any real e-commerce API refusing a second real
order with an identical real idempotency key; a real username-
registration endpoint refusing a real, already-taken name with a real
`409` instead of a real, generic `500`.

### SE Lens

The real, deliberately *not*-taken alternative here: letting a real
client supply its own real `id` directly, instead of this lesson's own
**Server-generated identifier** term. Rejected on purpose, matching
legacy's own real, existing design: a real, client-supplied identifier
would need its own real uniqueness check, its own real validation of
real format, and would let a real client accidentally (or
maliciously) collide with, or guess, another real part's own real ID.
Generating it real, server-side, from a real, random source, removes
an entire real category of real bugs and real attacks a client-supplied
identifier would otherwise require real, separate code to guard
against.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_creation.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — a real, machine-generated ID's own real shape
is exactly the kind of claim worth actually running, not assuming — so
this was actually run this session:

```
test_part_creation.py::test_create_part_requires_a_description PASSED
test_part_creation.py::test_create_part_succeeds_with_a_server_generated_id PASSED
test_part_creation.py::test_create_part_rejects_a_duplicate_part_number PASSED

3 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state — and genuinely not what was first assumed: `POST /api/parts`
returns a real `405`, not a real `404`. The real, honest reason: this
slice's own listing lesson already registered a real route at this
exact real path, `@app.route('/api/parts')`, with no real `methods=`
argument at all — Flask's own real, documented default is `GET` only.
A real `POST` to a real path that *does* match an existing real route,
just not for this real HTTP method, is Flask's own real, documented
`405 Method Not Allowed` — genuinely different from a real `404`, which
means no real route matched the real path at all. The correct, honest
starting RED here is `405`, not `404` — a real, small distinction worth
getting right, not assumed from this project's own earlier, different
real cases where nothing at the real path existed yet at all.

### Connecting this unit to what came before

This slice's own listing lesson proved what an empty, and a real,
already-populated, real backend returns. This unit is the first time
this project actually characterizes how real data gets there in the
first place.

---

## Connect the pieces

Three real, distinct outcomes of one real route — a real, missing
field, a real, successful creation with a real, server-generated ID,
and a real, duplicate rejection — are now real, automated,
machine-checked claims, proven against legacy and proven, honestly,
not yet true against `rebuild`.

---

**Next lesson:** the real pieces `rebuild`'s own implementation needs
— completing this project's own `Part` model with the real
construction logic this lesson's own tests actually exercise, then the
real route itself.
