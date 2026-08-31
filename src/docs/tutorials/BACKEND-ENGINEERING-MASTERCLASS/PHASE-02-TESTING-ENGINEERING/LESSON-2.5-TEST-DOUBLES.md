# Lesson 2.5: Test Doubles

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Four real, run checks against this project's own real `PDMService.get_history` - a function that, confirmed this session, cannot even be called directly in a test without a real Flask request context and a real GitLab token - each one substituting a different kind of stand-in for the real GitLab dependency it needs, plus a fifth, real, slightly alarming demonstration of what happens when the wrong thing gets replaced instead.

**What you need to know first:** What an integration test checks and why it needs a real collaborator; what a fixture is and how pytest injects one; what test isolation means and why a fixture's own scope controls it.

## Terms used in this lesson

- **test double** — A real, general umbrella term for any object substituted for a real, production dependency during a test - a mock, a stub, a fake, and a spy are each one specific kind of it. It exists as the general vocabulary for "not the real thing, standing in for it," so each of the four specific kinds below can be named precisely instead of everything getting called "a mock" loosely, which is the single most common real confusion in this whole topic.
- **mock** — A test double programmed with canned return values, whose real point is verifying *how* it was called - which methods, how many times, with what real arguments - not just standing in silently. It exists to answer a checkable question a stub cannot: "did my code actually call its dependency correctly?"
- **stub** — A test double that returns pre-programmed, canned answers when called, with no real logic behind those answers and no verification of how it was called. It exists as the simplest possible double: just enough to let code under test keep running past a real dependency it doesn't need to actually exercise.
- **fake** — A test double with a real, working, simplified implementation of its own - genuine logic, just not the production version. It exists for a dependency whose actual behavior (not merely its interface) matters to what's being checked, without paying the real cost or risk of the true, production implementation.
- **spy** — A test double - or a wrapper around a real object - that lets real behavior actually happen while also recording how it was called, for verification afterward. It exists to check real interactions without giving up the real behavior a stub or a mock would otherwise replace entirely.
- **monkeypatching** — Replacing a real name's real binding - a function, a method, an attribute - with something else, at runtime, for the duration of a test, then restoring the original afterward. It exists so a test can substitute a real double for a real dependency without editing the actual source code that calls it.

## Objects and methods used

- **`unittest.mock.patch`**
  - *What it is:* A real function (usable as a context manager or a decorator) from Python's own standard library `unittest.mock` module, that performs real monkeypatching.
  - *Implementation:* `patch(target, new=..., return_value=...)` - `target` is a real string naming exactly where a name is looked up (a module attribute path, as a string); inside a `with patch(...) as m:` block, that name is replaced with a mock (or whatever `new` names); once the block exits, the *original* real object is restored automatically, even if the test raised.
  - *Its use:* This lesson uses it, in every unit but the spy unit, to replace `get_gitlab_service` specifically inside `pdm_service.py`'s own module namespace - not inside `gitlab_service.py`, where that function is actually defined.
  - *Type:* A function from the standard library, used here as a context manager.
  - *Responsibility:* Temporarily rebinding one specific, named attribute to something else, and guaranteeing the original comes back afterward - even on failure.
  - *Depends on:* A real, correct target string - naming the module that actually *looks up* the name at call time, which is not necessarily the module the name was originally defined in.
  - *Connects to:* Targets `"app.services.pdm_service.get_gitlab_service"` throughout this lesson - the name as `pdm_service.py` itself imported and calls it, since that is the binding `PDMService.get_history` actually reads from when it runs.
  - *Shape:* Used as a context manager, yields the replacement object (often a real `MagicMock`) for use inside the `with` block; restores the original real binding once that block ends.

- **`unittest.mock.MagicMock`**
  - *What it is:* A real class from Python's standard library `unittest.mock` module, producing objects that automatically accept any method call or attribute access.
  - *Implementation:* `MagicMock(return_value=..., side_effect=...)` - any attribute access or call on an instance is itself recorded and returns another `MagicMock` by default, unless `return_value` fixes what a call returns, or `side_effect` (a real callable) is given, in which case calling the mock actually calls that callable and returns *its* result instead. Every call is recorded on real attributes: `.call_count`, `.call_args`, `.call_args_list`.
  - *Its use:* This lesson uses it two different ways: with `return_value` set, to build a real mock double; with `side_effect` set to a real, already-existing function, to build a real spy that still runs that function's genuine logic.
  - *Type:* A class from the standard library.
  - *Responsibility:* Standing in for literally any real object or function, recording every real interaction with it, while returning whatever it's told to (or nothing meaningful, by default) for each one.
  - *Depends on:* Nothing to construct; optional `return_value`/`side_effect` arguments.
  - *Connects to:* Constructed directly in this lesson's own mock and spy labs; passed as `patch`'s own replacement in the mock lab, and called directly, by name, in the spy lab.
  - *Shape:* A single object whose every attribute and call is itself another `MagicMock` (or the real, configured behavior) - real calls made on it are retrievable afterward as plain Python data (tuples of args and kwargs).

- **`PDMService.get_history`**
  - *What it is:* A real, existing static method on this project's own `PDMService`, retrieving a CAM file's commit history from GitLab.
  - *Implementation:* `def get_history(cam_file_id): ...` (`backend/app/services/pdm_service.py:142-160`) - looks up a real `CAMFile` row, calls `get_gitlab_service()` to get a real `GitLabService` instance, then calls `gitlab_service.get_commit_history(cam_file_id, filename=filename)` and returns `{'data': commits, 'currentVersion': ..., 'total': ...}`.
  - *Its use:* This lesson calls it, unmodified, against a real (test) `CAMFile` row in every unit but the spy unit, each time substituting a different kind of test double for the one real dependency it cannot safely call directly in a test.
  - *Type:* A `@staticmethod` on the `PDMService` class.
  - *Responsibility:* Turning a real GitLab service's own commit history into this project's own real response shape, alongside the CAM file's current version number.
  - *Depends on:* A real `CAMFile` row already existing in the database; a real (or, in this lesson, doubled) object from `get_gitlab_service()`.
  - *Connects to:* Calls `get_gitlab_service()` and then that result's own `get_commit_history` method; this lesson never modifies this function itself, only what `get_gitlab_service()` actually returns when it's called.
  - *Shape:* Takes one string (`cam_file_id`) in, returns one plain dict out with three real keys: `data` (a list), `currentVersion` (a string), `total` (an int).

- **`get_gitlab_service`**
  - *What it is:* A real, existing function in this project's backend, responsible for producing a real, configured `GitLabService` instance.
  - *Implementation:* `def get_gitlab_service() -> GitLabService:` (`backend/app/services/gitlab_service.py:291-306`) - reads `flask.request.headers` for per-user GitLab credentials, falling back to environment variables; confirmed this session, calling it with no active Flask request raises `RuntimeError: Working outside of request context.`
  - *Its use:* This lesson never calls the real version at all - every unit but the spy unit replaces it entirely with a test double, specifically because its own real requirements (a request context, a real token) make it unsafe or impossible to call directly here.
  - *Type:* A module-level function.
  - *Responsibility:* Producing one real, ready-to-use `GitLabService`, sourced from whichever real credentials are actually available.
  - *Depends on:* A real, active Flask request (to read per-user headers) or a real `GITLAB_TOKEN` environment variable - confirmed this session, neither is available in this lesson's own lab environment.
  - *Connects to:* Called, by name, from inside `PDMService.get_history`; this lesson's own `patch` calls target exactly this name, as `pdm_service.py` itself imported it.
  - *Shape:* Takes nothing in, returns one real `GitLabService` instance out - or raises, if neither credential source is available.

## Concept Unit: Mocks - Replacing a Real Dependency Entirely

### The Problem

This project's own real `PDMService.get_history` (`backend/app/services/pdm_service.py:142-160`) calls a real `get_gitlab_service()`, which itself needs a real Flask request context and a real GitLab token - confirmed this session, calling it directly here raises `RuntimeError: Working outside of request context.` How can this function's own real logic - not GitLab's - get checked at all?

Before reading on:

- `get_history`'s own real job is turning `gitlab_service.get_commit_history(...)`'s result into `{'data': ..., 'currentVersion': ..., 'total': ...}`. Does checking that job actually require a real GitLab server anywhere?
- `unittest.mock.patch` is given the string `"app.services.pdm_service.get_gitlab_service"` - not `"app.services.gitlab_service.get_gitlab_service"`, where that function is actually defined. Given that a Python `import` creates a real name binding inside the *importing* module, why would patching the second, "more correct-looking" location silently have no effect at all?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimens, both read again this session: `backend/app/services/pdm_service.py:142-160` (`PDMService.get_history`) and `backend/app/services/gitlab_service.py:291-306` (`get_gitlab_service`, confirmed this session to raise outside a real request context).
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** Real `Part`, `Machine`, and `CAMFile` rows, built the same way an earlier lesson's integration tests already built a `Machine` row.

### The New Code

A real `CAMFile`, and a real `MagicMock` standing in for GitLab entirely - programmed with a canned answer, and later checked for exactly how it was called:

**File:** `verification/phase-02/lab_pytest_demo/lab_mock_double.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from unittest.mock import patch, MagicMock
from app import create_app, db
from app.models.part import Part
from app.models.machine import Machine
from app.models.cam_file import CAMFile
from app.services.pdm_service import PDMService

app = create_app("testing")
with app.app_context():
    part = Part(id="P-TEST-001", part_number="1234567", description="Test Part")
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis")
    db.session.add(part)
    db.session.add(machine)
    db.session.commit()

    cam_file = CAMFile(id="C-TEST-001", part_id="P-TEST-001", machine_id="M-TEST-001",
                        file_name="test.cam", cam_file_original_name="test.cam")
    db.session.add(cam_file)
    db.session.commit()

    fake_gitlab = MagicMock()
    fake_gitlab.get_commit_history.return_value = [{"sha": "abc123", "message": "Initial commit"}]

    with patch("app.services.pdm_service.get_gitlab_service", return_value=fake_gitlab):
        result = PDMService.get_history("C-TEST-001")

    assert result["data"] == [{"sha": "abc123", "message": "Initial commit"}]
    assert result["total"] == 1
    fake_gitlab.get_commit_history.assert_called_once_with("C-TEST-001", filename="test.cam")
    print("mock check passed:", result)
    print("verified call:", fake_gitlab.get_commit_history.call_args)
```

### Mechanical Walkthrough

- `part = Part(...) / machine = Machine(...) / cam_file = CAMFile(...)` — Builds three real rows this specimen genuinely requires - `CAMFile` has real, `nullable=False` foreign keys to both `Part` and `Machine` (`backend/app/models/cam_file.py:23-24`), so all three have to exist before `get_history` can even look up the file.
- `fake_gitlab = MagicMock()` — Builds a real `MagicMock` - by itself, an object that will silently accept any attribute access or call.
- `fake_gitlab.get_commit_history.return_value = [...]` — Configures the specific, canned value `fake_gitlab`'s own `get_commit_history` attribute (itself automatically another `MagicMock`) should return when called - real setup, not real logic.
- `with patch("app.services.pdm_service.get_gitlab_service", return_value=fake_gitlab):` — Replaces the real `get_gitlab_service` name, as `pdm_service.py` itself looked it up, with a mock configured to return `fake_gitlab` whenever it's called - for the duration of this `with` block only.
- `result = PDMService.get_history("C-TEST-001")` — Calls the real, unmodified `get_history` - internally it calls the now-patched `get_gitlab_service()`, gets `fake_gitlab` back, and calls `fake_gitlab.get_commit_history(...)`, never touching a real request context or a real GitLab server at all.
- `assert result["data"] == [...] / assert result["total"] == 1` — Confirms `get_history`'s own real logic correctly turned the mock's canned commit list into this project's own real response shape - the thing this unit actually set out to check.
- `fake_gitlab.get_commit_history.assert_called_once_with("C-TEST-001", filename="test.cam")` — A real, built-in `MagicMock` assertion method: fails loudly if `get_commit_history` was called zero times, more than once, or with different real arguments than exactly these - this is the real, checkable "was my dependency used correctly" a mock specifically exists to answer.

### CS Lens

This is a **mock** used for real interaction verification, not just substitution. Also recognized in: any xUnit-family mocking library (Mockito for Java, Jest's own `jest.fn()`); a spy-satellite simulator standing in for a real one during a ground-control software test; a wire protocol test harness that checks a client sent exactly the right bytes, without a real server on the other end; and, in this project's own domain, a machine simulator verifying a post-processor emitted the exact right G-code sequence, without a real spindle ever turning.

### SE Lens

The design principle is separating "does my code call its dependency correctly" from "does that dependency itself work" - two genuinely different questions, and a mock is built specifically to answer the first one, cheaply and safely. The real alternative not chosen - calling the real `get_gitlab_service()` directly - isn't just slower; confirmed this session, it's not even possible here at all without a real HTTP request and a real, configured GitLab token this environment doesn't have. The honest cost of the mock built here: it proves `get_history` calls its dependency correctly *assuming* `GitLabService.get_commit_history`'s real return shape actually looks like what was programmed into `return_value` - if the real method's actual shape ever changes, this test would keep passing regardless, having never touched the real thing to notice.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_mock_double.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
mock check passed: {'data': [{'sha': 'abc123', 'message': 'Initial commit'}], 'currentVersion': '1.000', 'total': 1}
verified call: call('C-TEST-001', filename='test.cam')
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_mock_double_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the real specimen every later unit in this lesson reuses, and the real reason it needs a double at all.

## Concept Unit: Stubs - Canned Answers, Nothing More

### The Problem

The previous unit's mock did two real jobs at once: standing in for GitLab, and verifying exactly how it was called. Sometimes a test genuinely only needs the first job - what does a double built for only that look like?

Before reading on:

- If a test never calls `.assert_called_once_with(...)` or reads `.call_args` at all, does it actually matter whether the double it used was a `MagicMock` or a small, hand-written class with one method on it?
- A hand-written stub class has no built-in way to record how it was called, the way `MagicMock` does automatically. What real capability does that trade away, in exchange for what?

### Project Change

- **Reference Source:** No reference counterpart - the same real `PDMService.get_history` as the previous unit, checked again with a different real kind of double substituted for the same one dependency.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** The same real `Part`, `Machine`, and `CAMFile` rows as the previous unit.

### The New Code

A small, hand-written class with exactly one method, returning one fixed, canned answer - no recorded calls, no real logic:

**File:** `verification/phase-02/lab_pytest_demo/lab_stub_double.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from unittest.mock import patch
from app import create_app, db
from app.models.part import Part
from app.models.machine import Machine
from app.models.cam_file import CAMFile
from app.services.pdm_service import PDMService


class StubGitLabService:
    def get_commit_history(self, cam_file_id, filename=None):
        return [{"sha": "stub0001", "message": "stub commit"}]


app = create_app("testing")
with app.app_context():
    part = Part(id="P-TEST-001", part_number="1234567", description="Test Part")
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis")
    db.session.add(part)
    db.session.add(machine)
    db.session.commit()

    cam_file = CAMFile(id="C-TEST-001", part_id="P-TEST-001", machine_id="M-TEST-001",
                        file_name="test.cam", cam_file_original_name="test.cam")
    db.session.add(cam_file)
    db.session.commit()

    stub_gitlab = StubGitLabService()

    with patch("app.services.pdm_service.get_gitlab_service", return_value=stub_gitlab):
        result = PDMService.get_history("C-TEST-001")

    assert result["data"] == [{"sha": "stub0001", "message": "stub commit"}]
    print("stub check passed:", result)
```

### Mechanical Walkthrough

- `class StubGitLabService: def get_commit_history(self, cam_file_id, filename=None): return [...]` — An ordinary, hand-written Python class - not `MagicMock`, not any test library's own base class - with exactly one method, matching the one real method `get_history` actually calls, always returning the identical, hard-coded list regardless of what real arguments it's given.
- `stub_gitlab = StubGitLabService()` — Constructs one real instance - a genuine Python object, with genuinely none of `MagicMock`'s own automatic call-recording behavior.
- `with patch("app.services.pdm_service.get_gitlab_service", return_value=stub_gitlab):` — The identical patch target as the previous unit; only what it's configured to return has changed, from a `MagicMock` to this plain stub instance.
- `result = PDMService.get_history("C-TEST-001")` — Calls the same real, unmodified function; internally it calls `stub_gitlab.get_commit_history(...)`, an ordinary method call on an ordinary object, returning the one fixed answer it was written to return.
- `assert result["data"] == [{"sha": "stub0001", "message": "stub commit"}]` — The only check this unit makes - confirming `get_history` correctly passed the stub's canned answer through into this project's own real response shape; nothing here checks *how* `get_commit_history` was called, because the stub itself never recorded that.

### CS Lens

This is a **stub**: the plainest possible test double, existing purely to let code run past a dependency without answering anything about that dependency's own real behavior. Also recognized in: a hard-coded API response used in frontend development before a real backend endpoint exists; a `/dev/null`- style no-op logger swapped in during a test so real log output doesn't clutter it; and, in this project's own domain, a fixed, canned tool-offset value used to dry-run a program before the real probing cycle that would normally measure it.

### SE Lens

The design principle is using the smallest tool that actually answers the real question being asked. The real alternative already built, one unit ago - a `MagicMock`-based mock - can do everything a stub does and more (real call verification), so reaching for a stub instead is a deliberate choice to keep a test simpler and more explicit, not a lesser option settled for. The honest cost of a stub specifically: if `get_history`'s own real code ever stopped calling `get_commit_history` at all - a real, genuine bug - this unit's own test would still pass, because nothing here checks that the call happened, only that *if* it happened, the result got handled right; the previous unit's mock, with its own `assert_called_once_with`, would have caught exactly that.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_stub_double.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
stub check passed: {'data': [{'sha': 'stub0001', 'message': 'stub commit'}], 'currentVersion': '1.000', 'total': 1}
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_stub_double_output.txt`.

### Connection to the previous unit

The previous unit's double both stood in for GitLab and verified the call; this unit's does only the first job, on purpose, to make the real difference between those two jobs concrete.

## Concept Unit: Fakes - A Real, Working, Simplified Stand-In

### The Problem

A stub's canned answer never changes, no matter what it's asked. What if a test genuinely needs its double to behave differently depending on what's actually been stored in it - real logic, just not the production implementation?

Before reading on:

- If a real GitLab server would return different commits for different files, could a stub - which always returns the exact same fixed answer - ever correctly model that? What would have to change about it to actually behave that way?
- A fake's constructor here builds an empty Python dict. What real behavior does that make possible that neither the mock nor the stub from the previous two units actually had?

### Project Change

- **Reference Source:** No reference counterpart - the same real `PDMService.get_history`, checked again with a real, working, in-memory implementation substituted for GitLab instead.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** The same real `Part`, `Machine`, and `CAMFile` rows as the previous two units.

### The New Code

A small class with real, working storage - commits actually go in before they can come back out:

**File:** `verification/phase-02/lab_pytest_demo/lab_fake_double.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from unittest.mock import patch
from app import create_app, db
from app.models.part import Part
from app.models.machine import Machine
from app.models.cam_file import CAMFile
from app.services.pdm_service import PDMService


class FakeGitLabService:
    def __init__(self):
        self._commits = {}

    def add_commit(self, cam_file_id, filename, sha, message):
        self._commits.setdefault((cam_file_id, filename), []).append(
            {"sha": sha, "message": message}
        )

    def get_commit_history(self, cam_file_id, filename=None):
        return self._commits.get((cam_file_id, filename), [])


app = create_app("testing")
with app.app_context():
    part = Part(id="P-TEST-001", part_number="1234567", description="Test Part")
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis")
    db.session.add(part)
    db.session.add(machine)
    db.session.commit()

    cam_file = CAMFile(id="C-TEST-001", part_id="P-TEST-001", machine_id="M-TEST-001",
                        file_name="test.cam", cam_file_original_name="test.cam")
    db.session.add(cam_file)
    db.session.commit()

    fake_gitlab = FakeGitLabService()
    fake_gitlab.add_commit("C-TEST-001", "test.cam", "fake0001", "first real commit")
    fake_gitlab.add_commit("C-TEST-001", "test.cam", "fake0002", "second real commit")

    with patch("app.services.pdm_service.get_gitlab_service", return_value=fake_gitlab):
        result = PDMService.get_history("C-TEST-001")

    assert result["data"] == [
        {"sha": "fake0001", "message": "first real commit"},
        {"sha": "fake0002", "message": "second real commit"},
    ]
    assert result["total"] == 2
    print("fake check passed:", result)
```

### Mechanical Walkthrough

- `def __init__(self): self._commits = {}` — Builds one real, empty Python dict, keyed by `(cam_file_id, filename)` tuples - this fake's own genuine, working storage, not a canned value baked in at construction time.
- `def add_commit(self, cam_file_id, filename, sha, message): self._commits.setdefault(...).append(...)` — Real, working logic: appends a new commit dict onto whatever list already exists for that key, creating an empty list first via `.setdefault(...)` if this is the first commit added for that exact file.
- `def get_commit_history(self, cam_file_id, filename=None): return self._commits.get((cam_file_id, filename), [])` — Real, working retrieval: looks up the same tuple key, and genuinely returns whatever was actually added under it - behavior, not a fixed answer.
- `fake_gitlab.add_commit("C-TEST-001", "test.cam", "fake0001", ...) / add_commit(..., "fake0002", ...)` — Two real calls, before `get_history` ever runs, actually populating this fake's own storage - proof its behavior comes from what was put in, not from what was hard-coded.
- `result = PDMService.get_history("C-TEST-001")` — The same real call as the previous two units; internally calls `fake_gitlab.get_commit_history(...)`, which now genuinely computes its answer from the two real commits added a moment ago.
- `assert result["data"] == [...] (both commits, in order) / assert result["total"] == 2` — Confirms both real, separately-added commits came back, in the order they were added - something a stub, always returning one fixed list, could never have demonstrated.

### CS Lens

This is a **fake**: a genuinely working, simplified implementation standing in for a real one. Also recognized in: an in-memory SQLite database standing in for a real production database engine (an idea this curriculum has already used, repeatedly, for real); a local filesystem-backed fake standing in for a real cloud object store; a simulated GPS feed replaying real recorded coordinates instead of live satellite data; and, in this project's own domain, a machine simulator that genuinely executes real G-code logic step by step, without any physical axis actually moving.

### SE Lens

The design principle is that some dependencies' actual *behavior* - not just their interface - matters enough to a test to be worth genuinely implementing a simplified version of. The real alternative not chosen here - a stub, exactly like the previous unit's - could never have proven commits come back in the order they were added, because a stub's answer never depends on anything. The honest cost of a fake, made concrete by this exact unit: it is real code, with its own real logic, that can itself have bugs - and unlike this project's actual `db`-backed integration tests (which use the real, if in-memory, production database engine itself), a fake's own storage logic is never verified against the real GitLab API it's standing in for at all.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_fake_double.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
fake check passed: {'data': [{'sha': 'fake0001', 'message': 'first real commit'}, {'sha': 'fake0002', 'message': 'second real commit'}], 'currentVersion': '1.000', 'total': 2}
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_fake_double_output.txt`.

### Connection to the previous unit

The previous unit's stub could only ever say one fixed thing; this unit's fake genuinely computes its answer from what it was actually given - the same real specimen, checked against a strictly more capable kind of double.

## Concept Unit: Spies - Watching What Really Happened

### The Problem

Every double built so far in this lesson *replaced* GitLab entirely - none of them ran any of GitLab's own real logic. What if a test needs the real logic to genuinely run, while still recording exactly how it was called?

Before reading on:

- `STLScaffoldService._extract_operation_num`, reused from an earlier lesson, is a real function with real logic. If a test needs to confirm both that it returns the right answer *and* exactly how many times it gets called, could a mock (which replaces real behavior) actually answer the first half of that?
- `MagicMock(side_effect=real_function)` is given a real, already- existing function as its `side_effect`. What do you expect happens when the resulting mock is actually called - does the real function's own logic run, or only the mock's own recording behavior?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen: `STLScaffoldService._extract_operation_num` again (`backend/app/services/stl_scaffold_service.py:231-246`), the same real, currently-untested function this curriculum has reused since it was first introduced.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None beyond this project's own backend package being importable, as in every earlier lab reusing this same function.

### The New Code

The real function, wrapped so it still genuinely runs - with every real call recorded on the wrapper:

**File:** `verification/phase-02/lab_pytest_demo/lab_spy_double.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from unittest.mock import MagicMock
from app.services.stl_scaffold_service import STLScaffoldService

real_extract = STLScaffoldService._extract_operation_num
spy = MagicMock(side_effect=real_extract)

result_1 = spy("O1103")
result_2 = spy("O2104")

assert result_1 == "1"
assert result_2 == "2"
assert spy.call_count == 2
spy.assert_any_call("O1103")
spy.assert_any_call("O2104")
print("spy results (real behavior, unmodified):", result_1, result_2)
print("spy call_count:", spy.call_count)
print("spy call_args_list:", spy.call_args_list)
```

### Mechanical Walkthrough

- `real_extract = STLScaffoldService._extract_operation_num` — Saves a real reference to the real, unmodified static method - not a copy, not a double, the actual function object this curriculum has been calling since it first appeared.
- `spy = MagicMock(side_effect=real_extract)` — Builds a real `MagicMock`, but configured with `side_effect` set to the real function saved above - unlike this lesson's earlier `return_value`-based mock, calling `spy` now actually calls `real_extract` and hands back *its* real result, while still recording the call the same way any `MagicMock` does.
- `result_1 = spy("O1103") / result_2 = spy("O2104")` — Two real calls to the spy - each one genuinely runs `_extract_operation_num`'s own real string logic (the leading `O` strip, the digit check) and returns its real answer, `"1"` and `"2"` respectively.
- `assert result_1 == "1" / assert result_2 == "2"` — Confirms the real behavior genuinely ran and produced the real, correct answers - something none of this lesson's earlier, fully-replacing doubles could ever have checked, because none of them ran real logic at all.
- `assert spy.call_count == 2` — Confirms the spy was called exactly twice - real, interaction-level verification, the same kind a mock offers, layered on top of real behavior instead of replacing it.
- `spy.assert_any_call("O1103") / spy.assert_any_call("O2104")` — A real `MagicMock` assertion confirming each specific real call happened at some point, regardless of order - distinct from `assert_called_once_with`, which would demand exactly one call with exactly those arguments.

### CS Lens

This is a **spy**: real behavior, plus real, recorded observation of how it was used - the one kind of double in this lesson that doesn't trade away genuine execution for verification. Also recognized in: aspect-oriented programming's own logging/tracing wrappers around real method calls; a network proxy that forwards every real request to its real destination while also logging each one; a `strace`/`dtrace`-style system call tracer, watching a real program run without altering what it actually does; and, in this project's own domain, a real machine's own logged spindle-load data, recorded while a real program runs, without changing anything about how that program actually cuts.

### SE Lens

The design principle is that verification and real execution are not mutually exclusive - a spy is what a mock becomes once its `side_effect` is a real function instead of a canned value. The real alternative not chosen - one of this lesson's earlier, fully- replacing doubles - trades away real execution in exchange for control and safety; a spy keeps the real execution and gives up only some of that control (the real function's own real behavior determines the result, not the test author). The honest cost: a spy is only safe to build around a dependency that's actually safe to call for real - exactly why this unit reused `STLScaffoldService._extract_operation_num` (pure, no I/O) instead of `GitLabService.get_commit_history` (real network calls, real credentials), which every other unit in this lesson had to fully replace instead.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_spy_double.py` — Runs this as a plain script, from the repository root.

### Verification

```text
spy results (real behavior, unmodified): 1 2
spy call_count: 2
spy call_args_list: [call('O1103'), call('O2104')]
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_spy_double_output.txt`.

### Connection to the previous unit

Every previous unit in this lesson replaced real behavior with something else, deliberately, because the real dependency wasn't safe to call; this unit shows the one case where nothing had to be given up at all.

## Concept Unit: When Not to Mock - What a Double Can't Prove

### The Problem

Every double this lesson has built so far replaced GitLab - something genuinely unsafe to call directly in a test. What happens if the same technique gets pointed at something an earlier lesson already established as safe, and worth calling for real?

Before reading on:

- An earlier lesson's own integration test proved a real `Machine` row genuinely persists, by using a real (if in-memory) database. What would that test have actually proven if `db.session.get` itself had been mocked instead?
- If a mocked `db.session.get` is told to return a specific `Machine` object no matter what real ID it's queried with, could any test built on it ever notice a real, genuine database bug?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen: `Session` (`db.session`), the same real object an earlier lesson's own integration test used for real, this time deliberately mocked instead, to show what's lost.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None beyond this project's own backend package being importable.

### The New Code

The database itself, mocked - a real, working demonstration of exactly the danger this unit is naming:

**File:** `verification/phase-02/lab_pytest_demo/lab_overmocking_danger.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from unittest.mock import patch
from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")
with app.app_context():
    fake_machine = Machine(id="M-FAKE", name="Not Real", category="mill", sub_type="3_axis")

    with patch("app.db.session.get", return_value=fake_machine):
        result = db.session.get(Machine, "ANYTHING-AT-ALL")
        assert result is fake_machine
        assert result.name == "Not Real"

    real_count = Machine.query.count()
    print("test passed - but real Machine rows in the database:", real_count)
    print("the queried id, 'ANYTHING-AT-ALL', was never a real row at all")
```

### Mechanical Walkthrough

- `fake_machine = Machine(id="M-FAKE", name="Not Real", ...)` — Builds one real, in-memory `Machine` Python object - but, deliberately, never calls `db.session.add` or `.commit` on it; it is never a real row in any database at all.
- `with patch("app.db.session.get", return_value=fake_machine):` — Replaces `db.session.get` itself - the real query method an earlier lesson's own integration test relied on to prove persistence - so that it now unconditionally returns `fake_machine`, no matter what arguments it's actually called with.
- `result = db.session.get(Machine, "ANYTHING-AT-ALL")` — Calls the now-mocked method with an ID that was never inserted anywhere, real or otherwise - genuinely arbitrary, on purpose.
- `assert result is fake_machine / assert result.name == "Not Real"` — Both pass - not because any real persistence happened, but because the mock was told, directly, what to return, regardless of the query.
- `real_count = Machine.query.count()` — A genuine, unmocked query against the real (if in-memory) database - `Machine.query` was never patched, only `db.session.get` was, so this line still tells the truth.
- `print("test passed - but real Machine rows in the database:", real_count)` — Prints the real, honest count - `0` - directly alongside the fact that the assertions above still passed, making the gap visible instead of leaving it implicit.

### CS Lens

This is **over-mocking**: replacing the exact thing a test's own real job is to verify, leaving the test checking nothing real at all. Also recognized in: a payment-processing test that mocks the payment gateway's own success/failure logic, then "verifies" payments always succeed; a compiler test that mocks the parser it exists to test; a security control tested against a mocked permission check that always returns `True`; and, in this project's own domain, a proveout "verified" by a simulator that was itself told the part passes, instead of by actually measuring the real, physical part.

### SE Lens

The design principle is that a double belongs at the boundary of what a test is *not* trying to verify - never on the thing the test's own real job is to check. This lesson's earlier units all mocked GitLab specifically because none of them were trying to verify GitLab's own correctness, only `PDMService.get_history`'s own logic around it; this unit's real, run demonstration shows the opposite mistake, mocking the exact dependency - the database - an earlier lesson's own integration test exists specifically to exercise for real. The honest, blunt cost, proven directly above: a test built this way can pass with zero real rows in the database, checking nothing about whether persistence itself actually works - the single thing that kind of test was supposed to prove.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_overmocking_danger.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
test passed - but real Machine rows in the database: 0
the queried id, 'ANYTHING-AT-ALL', was never a real row at all
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_overmocking_danger_output.txt`.

### Connection to the previous unit

Every previous unit in this lesson used a double correctly, at a real dependency none of them were trying to verify; this unit closes the lesson by showing the same real technique aimed at the wrong target, and exactly what gets lost when it is.

## Connect the pieces

One real function, `PDMService.get_history`, confirmed this session to be impossible to call directly in a test at all - no real request context, no real GitLab token. A `MagicMock`, configured with a canned commit list, standing in for GitLab entirely, its own real call verified afterward with `assert_called_once_with` (a mock). A small, hand-written class returning that same canned answer, with no call recorded anywhere - the identical real check, minus one real capability (a stub). A class with genuine, working storage, proving two separately-added commits come back in the order they were added - behavior no stub could ever have shown (a fake). The same real, currently-untested `_extract_operation_num`, wrapped so its real logic still runs while every real call gets recorded on top of it (a spy). And, last, the exact same mocking technique aimed at the database instead of GitLab - a test that passes with zero real rows in it, proving nothing about the one thing it should have proven (when not to mock). Four real ways to stand in for a dependency safely, and one real, run proof of what happens when the wrong dependency gets replaced.

**Next lesson:** Every test built across this lesson checked a backend function called directly, in Python. Next, this curriculum moves to checking this project's real backend the way its actual callers do - over real HTTP, against real routes, the same real request/response shape a system test first touched several lessons ago, now treated as its own, full subject.