# Lesson 0.7: A Decorator That Isn't What It Claims

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, small tool finding every real route in this application whose `@token_required` role list includes `'operator'` - then a real reading of that same decorator's own documented control flow, side by side with one concrete real route it actually reaches. The transferable problem: a decorator's docstring can be genuinely honest about what it does and still mislead about how far it actually reaches - reading the documented behavior is not the same as reading its real, mechanical scope across the whole codebase.

**What you need to know first:** Finding real callers of a name across an entire codebase mechanically, rather than trusting a file's name or position; reading a real, existing file's own control flow as evidence.

## Terms used in this lesson

- **Control flow** — The real, actual order a program's statements execute in and the real conditions that decide which branch runs - as opposed to what a comment or docstring claims happens. It exists as a concept because the two can genuinely diverge: code can be accurately documented for the case its author had in mind while still reaching further, or narrower, than that documentation implies once every real caller is accounted for.

## Objects and methods used

- **`Path`**
  - *What it is:* The standard-library class representing a real filesystem path, from Python's `pathlib` module.
  - *Implementation:* `pathlib.Path(path_string)`
  - *Its use:* This lesson's lab constructs one pointing at `backend/app/routes`, the real directory holding every real route file, to search every one of them.
  - *Type:* A class, in Python's standard library `pathlib` module.
  - *Responsibility:* Represent a filesystem location and provide real methods for inspecting or navigating it, without itself reading any file's content.
  - *Depends on:* A string naming the path - real or not; `Path` itself doesn't check existence until a method that touches the filesystem is called.
  - *Connects to:* Its `rglob` method, below, is called directly on the constructed instance.
  - *Shape:* Takes one string; returns one `Path` object representing that location, ready for further real filesystem operations.

- **`Path.rglob`**
  - *What it is:* A method listing every real file matching a pattern, searching a directory and every real subdirectory beneath it.
  - *Implementation:* `Path.rglob(pattern: str) -> Iterator[Path]`
  - *Its use:* This lesson's lab calls it with `"*.py"` on the real `backend/app/routes` directory, so every real route file is checked, regardless of which real subdirectory it lives in.
  - *Type:* An instance method on `Path`.
  - *Responsibility:* Recursively scan the real directory this `Path` represents and yield one `Path` object for every real file whose name matches the given pattern.
  - *Depends on:* The `Path` it's called on actually existing as a real directory.
  - *Connects to:* Each yielded `Path` is read directly by `Path.read_text`, below.
  - *Shape:* Takes one pattern string; returns a generator yielding one `Path` per real matching file, anywhere in the real directory tree beneath the starting path.

- **`Path.read_text`**
  - *What it is:* A method reading a real file's entire content as one plain string.
  - *Implementation:* `Path.read_text(encoding: str = None, errors: str = None) -> str`
  - *Its use:* This lesson's lab calls it on each real route file `rglob` found, to search that file's actual source text for real `@token_required` calls.
  - *Type:* An instance method on `Path`.
  - *Responsibility:* Open the real file this `Path` points at, read its entire real content, and return it as one plain Python string.
  - *Depends on:* The `Path` it's called on being a real, readable file.
  - *Connects to:* Its return value is searched by `re.findall`, below.
  - *Shape:* Takes no required argument for this lab's use; returns one plain string holding the file's entire real text content.

- **`re.findall`**
  - *What it is:* A standard-library function returning every real match of a pattern found in a string.
  - *Implementation:* `re.findall(pattern: str, string: str) -> list[str]`
  - *Its use:* This lesson's lab uses it to pull every real `@token_required(allowed_roles=[...])` call's own role-list text directly out of a route file's source, as a plain string, without hand-scanning the file by eye.
  - *Type:* A free function, in Python's standard library `re` module.
  - *Responsibility:* Search the given string for every real, non-overlapping match of the given pattern, and return the parts captured by that pattern's own parentheses - one real captured string per match, in the order they appear.
  - *Depends on:* A valid regular-expression pattern string; a string to search.
  - *Connects to:* Each returned string is checked with Python's own `in` operator for the literal text `'operator'`.
  - *Shape:* Takes a pattern string and a text string; returns a plain list of strings - here, one per real `@token_required` call found, each being that call's own `allowed_roles=[...]` text, captured by the pattern's own parentheses rather than the whole matched text.

## Concept Unit: Finding Every Route This Bypass Actually Reaches

### The Problem

`token_required`'s own docstring, in `backend/app/utils/auth_utils.py`, plainly documents a real "Operator Bypass": when no token is present and `'operator'` is in a route's allowed roles, the route runs anyway, with `current_user=None`. It even gives a stated reason - shop-floor operators share machines and have physical access controls instead of logins. That's a real, honest piece of documentation, not a hidden trap. What it doesn't state anywhere is how many real routes, and which ones, actually include `'operator'` in their own allowed-roles list - and whether all of them genuinely fit the "shop-floor display" case the rationale describes.

Before reading on:

- Before checking, would you expect a bypass justified for 'a shop-floor display anyone can view' to apply to a small, specific set of routes, or broadly? What real fact about this codebase - not this one decorator's own code - would tell you which?
- The bypass fires whenever `'operator'` appears anywhere in a route's `allowed_roles` list. What would you need to check, in every real route file, to find out exactly how far that actually reaches?

### Project Change

- **Reference Source:** `backend/app/utils/auth_utils.py`, read in full this session - specifically its own docstring's "Special Behavior - Operator Bypass" section and the real `allowed_roles` parameter `token_required` accepts.
- **Files affected:** `verification/phase-00/lab_find_operator_routes.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's standard library `pathlib` and `re` modules only.

Rather than guess how many real routes this affects, this unit builds a small, real tool that searches every real file in `backend/app/routes` for the literal, real shape `@token_required(allowed_roles=[...])`, and reports every one whose role list contains `'operator'`.

### The New Code

New code, typed into a new throwaway file - the whole file at once, since there's no existing structure to return to for something this small:

**File:** `verification/phase-00/lab_find_operator_routes.py` (new)

```python
import re
from pathlib import Path

for path in sorted(Path("backend/app/routes").rglob("*.py")):
    text = path.read_text(encoding="utf-8", errors="ignore")
    for roles in re.findall(r"@token_required\(allowed_roles=(\[[^\]]*\])\)", text):
        if "'operator'" in roles:
            print(f"{path}: {roles}")
```

### Mechanical Walkthrough

- `for path in sorted(Path("backend/app/routes").rglob("*.py")):` — `Path` builds a real handle on the routes directory; `Path.rglob(\"*.py\")` yields every real route file beneath it; `sorted()` (basic Python) gives a stable, readable order.
- `text = path.read_text(encoding="utf-8", errors="ignore")` — `Path.read_text` reads each real file's entire source as one string, so its actual decorator calls can be searched directly.
- `for roles in re.findall(r"@token_required\(allowed_roles=(\[[^\]]*\])\)", text):` — `re.findall` searches that real text for every real `@token_required(allowed_roles=[...])` call, capturing just the `[...]` role-list text via the pattern's own parentheses - so `roles` is a real string like `\"['operator', 'quality', 'programming', 'admin']\"` for each real match, exactly as it appears in the source.
- `if "'operator'" in roles: print(f"{path}: {roles}")` — Python's own `in` operator (basic Python) checks whether the literal text `'operator'` appears in that captured role list; only real matches are printed, each labeled with the real file it came from.

### CS Lens

This is still static analysis - the same real approach as the previous two lessons' tools, applied now to a decorator's real arguments instead of a function's name or a module's real importers. The same underlying idea recurs as a security scanner flagging every real call site of a dangerous function across a whole codebase, or a linter finding every real usage of a deprecated API - in every case, the question "how far does this actually reach" is answered by searching real source across many files, not by reading one function's own code closely.

### SE Lens

The real alternative not chosen: reading `token_required`'s docstring and trusting its stated scope ("operator dashboard that anyone can view") without checking how many real routes actually opt into it. The honest cost of that trust, made visible by this unit's own real output: 14 real matches, spread across 4 different route files (`bootstrap.py`, `cam_files.py`, `machines.py`, `parts.py`), all sharing the identical role list `['operator', 'quality', 'programming', 'admin']` - a specific number and a specific real spread the docstring's own prose never states, and that the next unit shows doesn't actually match what those routes are.

### Commands needed

- `python verification/phase-00/lab_find_operator_routes.py` — Run from the manufacturing-platform repository root, so the relative path to `backend/app/routes` resolves correctly.

### Verification

```text
backend\app\routes\bootstrap.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\cam_files.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\cam_files.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\cam_files.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\cam_files.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\machines.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\machines.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\machines.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\machines.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\machines.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\parts.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\parts.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\parts.py: ['operator', 'quality', 'programming', 'admin']
backend\app\routes\parts.py: ['operator', 'quality', 'programming', 'admin']
```

Full saved run: `verification/phase-00/lab_find_operator_routes_output.txt`.

### Connection to the previous unit

There is no previous unit before this one in this lesson.

## Concept Unit: Reading the Bypass's Own Real Control Flow

### The Problem

The unit above found 14 real routes the bypass reaches. Whether that's actually a problem depends on what those routes really are - and on reading `token_required`'s own real branching logic directly, not just its docstring's summary of it.

Before reading on:

- Given that `GET /api/parts` - a real route listing every part this application manages - is one of the 14 matches found above, does the docstring's own justification ('operator dashboard that anyone can view') still describe what's actually happening when that specific route runs with no token at all?

### Project Change

- **Reference Source:** `backend/app/utils/auth_utils.py:415-424` (the real bypass branch) and `backend/app/routes/parts.py:18-20` (`GET /api/parts`), both read verbatim this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A
- **Dependencies:** None beyond the real repository already checked out on disk.

The real branch below is what `token_required` actually executes when no `Authorization` header is present; the real route below it is one concrete example, from the 14 found above, of exactly what that branch lets through with no authentication at all.

### The Updated Project

**File:** `backend/app/utils/auth_utils.py` (already exists — read-only, nothing to type)

```python
token = None

if 'Authorization' in request.headers:
    auth_header = request.headers['Authorization']
    if auth_header.startswith('Bearer '):
        token = auth_header.split(" ")[1]

if not token:
    if allowed_roles and 'operator' in allowed_roles:
        return f(None, *args, **kwargs)

    print(f"[Auth] Access Denied: Token missing for protected route {request.path}")
    return jsonify({
        'error': 'Authentication token required',
        'code': 'TOKEN_MISSING',
        'path': request.path
    }), 401
```

**File:** `backend/app/routes/parts.py` (already exists — read-only, nothing to type)

```python
@parts_bp.route('', methods=['GET'])
@token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
def get_parts(current_user):
    """
    GET /api/parts

    List all parts with optional filtering.
```

### Mechanical Walkthrough

- `if 'Authorization' in request.headers: ... token = auth_header.split(" ")[1]` — Reads the real `Authorization` header if one was sent, and extracts the real token text following `\"Bearer \"` - basic Python string handling; `token` stays `None` if no such header exists at all.
- `if not token: if allowed_roles and 'operator' in allowed_roles: return f(None, *args, **kwargs)` — This is the real bypass: the check is only ever "does this ONE route's own `allowed_roles` list happen to contain `'operator'`" - the same real condition true for all 14 routes found above. There's no separate, narrower flag for "this specific route is meant to be an anonymous shop-floor display" - the docstring's rationale describes one intended use, but the real code applies to every route that shares that one role in its list, for whatever reason it's there.
- `print(...) ... return jsonify({'error': ..., 'code': 'TOKEN_MISSING', ...}), 401` — The real path taken only when `'operator'` is NOT in the route's allowed roles - a real `401` response. This is what most of the application's protected routes actually get; the 14 routes above never reach this branch at all.
- `@token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])` — `GET /api/parts`'s own real decorator - a general business listing endpoint, not a shop-floor kiosk display, sharing the exact same role list as the other 13 routes found above, purely because `'operator'` was included as one of several legitimate roles for reading part data.

### Mental Model

```text
Request arrives, no Authorization header
            |
            v
  'operator' in this ROUTE's allowed_roles?
     |                        |
    yes                       no
     |                        |
     v                        v
run the route,          401 Unauthorized
current_user=None      (most protected routes
(true for all 14        end up here instead)
routes found above,
including GET /api/parts -
not just shop-floor displays)

The branch has no separate signal for "this route is an
intentional anonymous kiosk display" versus "this route happens
to also allow the 'operator' role for an unrelated reason" - both
take the identical real path.
```

### CS Lens

This is the gap between a documented design intent and a mechanism's actual, unconditional scope - the docstring describes one motivating case, but the real `if` statement doesn't check for that case specifically, only for the presence of one string in a list. The same shape recurs whenever a permission check is written broader than its stated justification: a feature flag meant for one specific rollout that accidentally gates unrelated code sharing the same flag name, or a cache invalidation rule meant for one data type that also silently clears an unrelated one sharing the same key prefix.

### SE Lens

The real alternative not chosen: a bypass scoped to specific routes explicitly marked as public displays, rather than to any route that happens to list `'operator'` among several legitimate roles. The real, honest cost, visible directly in the code shown above: every one of the 14 real routes found in the unit above - including `GET /api/parts`, a general data-listing endpoint - runs with zero authentication whenever no token is sent, regardless of whether that specific route was ever meant to be publicly viewable.

### Verification

Not applicable under the Verification Rule's own exemption: no execution is required for this unit's actual claim. Both files shown above are quoted verbatim from real, already-existing source, read this session - the source establishes the real control flow being examined (that the bypass checks only for `'operator'`'s presence in the list, with no further distinction). It does not establish runtime behavior - what a real HTTP request to `GET /api/parts` with no `Authorization` header actually returns - which would need a separate execution trace, not a citation.

### Connection to the previous unit

The unit above found exactly which real routes this bypass reaches; this unit read the real branch that decides it, and showed that its condition is broader than the rationale used to justify it.

## Connect the pieces

One real decorator, read two ways: first, mechanically, by the tool built above, which found 14 real routes across `bootstrap.py`, `cam_files.py`, `machines.py`, and `parts.py` whose `allowed_roles` list includes `'operator'`; then directly, by reading `token_required`'s own real branch (`auth_utils.py:415-424`), which shows the bypass fires for any of them alike, with no distinction between an intentional shop-floor display and a route like `GET /api/parts` that merely also allows the `'operator'` role. The docstring wasn't dishonest - it explained a real, working mechanism correctly - but reading it alone, without mechanically checking its real scope, would have missed exactly how far that mechanism actually reaches.

**Next lesson:** Turning this same habit toward a claim that can't be settled by reading source at all - what a real, already-broken piece of this application's own history actually does when it's run.