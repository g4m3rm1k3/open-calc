# Lesson 44: Testing the Real Part Models List

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Real Update is a complete,
> closed, full-stack slice; this is a real, fifth, separate slice on
> this same real resource's own real sub-resource — a part's 3D
> models.

## What you will build

A real, automated characterization of legacy's own, already-existing
`GET /api/parts/<id>/models`, deliberately scoped to its own real,
empty case — no uploaded 3D models yet, and no real, synthetic entries
either — the smallest real slice of a route this project's own,
already-established **Operator bypass** term turns out to touch
again.

## What you need to know first

The real, already-tested `token_required` decorator and this
project's own real **Operator bypass** term, already given full
treatment. This slice's own real, already-proven `POST /api/parts`,
reused here only to create a real part to ask about.

## Terms introduced

None genuinely new — this lesson revisits this project's own,
already-established **Operator bypass** term on a real, different
route.

## Objects and methods used

None genuinely new beyond this project's own, already fully-treated
`Flask.test_client().get(path, headers=...)`.

---

## Concept Unit: The Operator Bypass, Found a Third Time

### The Problem

Legacy's own real `get_part_models` route exists, already runs, and
this project has no real, automated proof of what it actually returns
for the real, simplest case: a real part with no real, uploaded 3D
models at all. The real question this unit answers: does this real
route share the identical real, permissive `allowed_roles` list this
project's own real listing route already has — and does that mean this
project's own real **Operator bypass** applies here too?

> **Before reading on:** this project's own real listing route
> (`GET /api/parts`) and this real route both answer a real `GET`
> request about real parts. Given that the real **Operator bypass**
> only ever depends on whether `'operator'` appears in a real route's
> own `allowed_roles` list — not on *which* route it is — what would
> you guess this real route's own real, allowed-roles list actually
> contains?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `get_part_models` function, read in full this session, lines
  241–300: decorated `@token_required(allowed_roles=['operator',
  'quality', 'programming', 'admin'])` — the identical real, permissive
  list this project's own real listing route already has, `'operator'`
  real and included. Looks a real part up by its own real ID, returns
  a real `404` if none exists; queries `PartModel.query.filter_by(
  part_id=part_id).order_by(PartModel.priority.desc()).all()`, then
  appends real, synthetic entries if the real part's own
  `final_model_path` or `fixture_model_path` are set (this project's
  own next, deeper lesson characterizes those; deliberately deferred
  here — see the SE Lens, below). Returns
  `{'data': [...], 'total': len(...)}`.
- **Files affected** — created:
  `acceptance-tests/test_part_models.py`.
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


def test_list_part_models_with_no_token_succeeds_via_the_operator_bypass():
    client = get_client()
    admin_token = _admin_token(client)

    created = client.post('/api/parts', json={
        'partNumber': '3334445',
        'description': 'Model list check, for real',
    }, headers={'Authorization': f'Bearer {admin_token}'})
    part_id = created.get_json()['data']['id']

    response = client.get(f'/api/parts/{part_id}/models')
    assert response.status_code == 200
    assert response.get_json() == {'data': [], 'total': 0}
```

### The Updated Project

`acceptance-tests/test_part_models.py`, in full — brand new, so this
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
12 def test_list_part_models_with_no_token_succeeds_via_the_operator_bypass():
13     client = get_client()
14     admin_token = _admin_token(client)
15
16     created = client.post('/api/parts', json={
17         'partNumber': '3334445',
18         'description': 'Model list check, for real',
19     }, headers={'Authorization': f'Bearer {admin_token}'})
20     part_id = created.get_json()['data']['id']
21
22     response = client.get(f'/api/parts/{part_id}/models')
23     assert response.status_code == 200
24     assert response.get_json() == {'data': [], 'total': 0}
```

Two more real cases complete this unit — a real, unknown part, and a
real, disallowed role:

```python
def test_list_part_models_with_unknown_part_returns_404():
    client = get_client()
    admin_token = _admin_token(client)

    response = client.get('/api/parts/no-such-part/models', headers={
        'Authorization': f'Bearer {admin_token}',
    })
    assert response.status_code == 404


def test_list_part_models_rejects_a_role_not_in_the_allowed_list():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '3334447',
        'description': 'Role check, for real',
    }, headers=auth)
    part_id = created.get_json()['data']['id']

    register = client.post('/api/auth/register', json={
        'email': 'eng2@mfg.com',
        'password': 'temporary',
        'name': 'Design Engineer Two',
        'role': 'engineering',
    }, headers=auth)
    assert register.status_code == 201

    eng_login = client.post('/api/auth/login', json={
        'email': 'eng2@mfg.com',
        'password': 'temporary',
    })
    eng_token = eng_login.get_json()['token']

    response = client.get(f'/api/parts/{part_id}/models', headers={
        'Authorization': f'Bearer {eng_token}',
    })
    assert response.status_code == 403
```

`acceptance-tests/test_part_models.py`, in full, with these two real
functions added:

```python
25
26
27 def test_list_part_models_with_unknown_part_returns_404():
28     client = get_client()
29     admin_token = _admin_token(client)
30
31     response = client.get('/api/parts/no-such-part/models', headers={
32         'Authorization': f'Bearer {admin_token}',
33     })
34     assert response.status_code == 404
35
36
37 def test_list_part_models_rejects_a_role_not_in_the_allowed_list():
38     client = get_client()
39     admin_token = _admin_token(client)
40     auth = {'Authorization': f'Bearer {admin_token}'}
41
42     created = client.post('/api/parts', json={
43         'partNumber': '3334447',
44         'description': 'Role check, for real',
45     }, headers=auth)
46     part_id = created.get_json()['data']['id']
47
48     register = client.post('/api/auth/register', json={
49         'email': 'eng2@mfg.com',
50         'password': 'temporary',
51         'name': 'Design Engineer Two',
52         'role': 'engineering',
53     }, headers=auth)
54     assert register.status_code == 201
55
56     eng_login = client.post('/api/auth/login', json={
57         'email': 'eng2@mfg.com',
58         'password': 'temporary',
59     })
60     eng_token = eng_login.get_json()['token']
61
62     response = client.get(f'/api/parts/{part_id}/models', headers={
63         'Authorization': f'Bearer {eng_token}',
64     })
65     assert response.status_code == 403
```

### Mechanical Walkthrough

- **Line 22, `client.get(f'/api/parts/{part_id}/models')`** — real and
  deliberately no `headers` argument at all, simulating a real,
  completely unauthenticated request.
- **Line 23, `assert response.status_code == 200`** — real, direct
  proof of this unit's own opening prediction: this real route's own
  real **Operator bypass** applies, exactly as the identical real
  listing route already established.
- **Line 24, `assert response.get_json() == {'data': [], 'total':
  0}`** — this project's own real **Collection envelope**, already
  proven for parts, now proven for this real part's own real
  sub-resource too.
- **Line 34, `assert response.status_code == 404`** — the identical
  real "resource doesn't exist" case every other real Parts route
  already establishes.
- **Lines 48–54, registering a real, `engineering` role** — a real
  role genuinely absent from this route's own `allowed_roles`, the
  identical real pattern this project's own listing lesson already
  used to prove a real, disallowed role.
- **Line 65, `assert response.status_code == 403`** — real, direct
  proof this route enforces its own real, allowed-roles list on a
  real, valid but insufficient identity, exactly like every other real,
  protected route already does.

### CS Lens

This is the identical real **conditional middleware behavior** this
project's own listing-route implementation lesson already named in
full: the identical real `token_required` decorator, unchanged,
producing a real, different observable outcome purely because of the
real, specific `allowed_roles` argument *this* route happens to pass
it.

Also recognized in: the identical real example already given.

### SE Lens

The real, deliberately *not*-taken alternative here: characterizing
this route's own real, synthetic-entry behavior (a real part whose own
`finalModelPath`/`fixtureModelPath` are set) in this same lesson,
since actual execution this session already confirmed legacy produces
two real, well-formed synthetic entries for that real case. Rejected
on purpose, matching this project's own real, repeated discipline:
this project's own real `Part.from_dict` doesn't even accept those two
real fields yet (a real, deliberate gap from this project's own
creation-route lesson, which built only what a real, stated
requirement needed then) — characterizing a real behavior this project
can't yet produce on the `rebuild` side would be real, premature scope,
not a real, minimal next step. This real, richer case is a real,
explicit candidate for a real, later, deeper lesson.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_models.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, third route sharing the
identical real, permissive role list actually triggers the real
**Operator bypass** the same way — so this was actually run this
session, against legacy:

```
test_part_models.py::test_list_part_models_with_no_token_succeeds_via_the_operator_bypass PASSED
test_part_models.py::test_list_part_models_with_unknown_part_returns_404 PASSED
test_part_models.py::test_list_part_models_rejects_a_role_not_in_the_allowed_list PASSED

3 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state: the real, unknown-part case already passes, real and by
coincidence (no route matches this real path at all yet, the identical
real reason this has happened before); the other two real cases fail
with a real `404`, since no real route exists here yet at all.

### Connecting this unit to what came before

This project's own listing-route lesson found the real **Operator
bypass** once. The authorization-implementation lesson revisited it a
second time, deciding to Preserve it structurally. This unit is the
third real place it actually, concretely matters.

---

## Connect the pieces

Three real, distinct, now-automated claims about a real part's own
sub-resource: an anonymous request succeeds via this project's own
real **Operator bypass**, an unknown part is real, honestly rejected,
and a real, valid but insufficient role is real, correctly refused —
proven against legacy and proven, honestly, not yet true against
`rebuild`.

---

**Next lesson:** the real, smallest backend change making all three of
this lesson's own real tests pass against `rebuild` — the real
`PartModel` model, and the real route reading it.
