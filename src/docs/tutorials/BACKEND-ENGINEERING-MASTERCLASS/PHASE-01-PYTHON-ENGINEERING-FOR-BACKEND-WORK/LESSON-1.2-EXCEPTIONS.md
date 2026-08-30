# Lesson 1.2: Exceptions

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** How a raised exception propagates through functions that don't catch it, and where a deliberately placed `try`/`except` stops that propagation - first in a real, small, three-function call chain with nothing else going on, then in a real function already investigated in this curriculum, which turns out to have not one boundary but two: one, inside the function itself, that catches a real infrastructure failure and never lets it out at all; another, in its caller, broad enough to catch what does get out without telling two different real domain conditions apart.

**What you need to know first:** Reading a real, existing file as evidence; a function's real parameters, return value, and side effects as distinct, checkable facts about it.

## Terms used in this lesson

- **Raising an exception** — Deliberately signaling that something has gone wrong using Python's own `raise` statement, naming a specific exception type - `ValueError`, `FileNotFoundError` - rather than continuing as if nothing happened. It exists so a function that cannot do its real job can say so immediately, in a form the language itself will keep passing upward until something actually deals with it - propagation, below.
- **Propagation** — What a raised exception does by default, with nothing extra required: it exits the function that raised it immediately, then exits whatever called that function, then whatever called that, one real stack frame at a time, until some code actually catches it or there's no caller left at all. It exists as its own concept because it's easy to assume an exception "goes" somewhere specific - it doesn't, until a real `except` block says otherwise; silence, not interception, is the default.
- **Exception handling (try/except)** — Deliberately stopping propagation at one specific, chosen point, using Python's real `try`/`except` statement, naming which exception type(s) to intercept and what real code should run instead of letting the exception keep traveling. It exists so a real failure can be handled exactly once, at whichever real point in a call chain actually has enough information to decide what to do about it - not automatically at the place closest to where it happened.
- **Exception boundary** — The specific, real place in a call chain where a `try`/`except` is deliberately placed to catch a propagating exception, chosen because that real location is where enough context exists to decide what response is correct - not chosen by default, and not necessarily the innermost function that could have caught it. It exists because a boundary placed too early can hide real information a caller further up would have needed; a boundary placed too late lets a real failure propagate further than necessary.
- **Domain exception** — An exception type representing a real, meaningful business condition the code recognizes and is designed to detect - the code itself is working correctly; it's reporting a real fact about the specific request it was given, like "no row exists for this id." It exists as its own category because a domain exception usually deserves a specific, informative response - the caller asked for something the domain doesn't allow or doesn't have, not something the system failed to do.
- **Infrastructure exception** — An exception representing a failure in a real, external, technical dependency the code relies on but doesn't control - a network timeout, an unreachable service, a broken connection - rather than a business decision about the current request. It exists as its own category, distinct from a domain exception, because the correct response is usually different: retry, fall back, or report a real operational problem - not tell the caller their request itself was invalid.

## Objects and methods used

- **`PDMService.download_file`**
  - *What it is:* The same real static method already investigated for its real fallback behavior and its real parameters - shown here for a third real question: which real domain condition each of its own two raised exceptions represents, and which real failure inside it is instead caught internally as an infrastructure one.
  - *Implementation:* `PDMService.download_file(cam_file_id, commit_sha=None)`, defined at `backend/app/services/pdm_service.py:162-190`.
  - *Its use:* This lesson's second unit reads its real body to identify exactly where it raises, what it raises, and the one place inside it that already catches a real infrastructure failure rather than letting it propagate.
  - *Type:* A static method on the `PDMService` class.
  - *Responsibility:* Raise a built-in exception type, used here to represent a specific real domain condition, the moment a real precondition fails (no such row, no content anywhere); catch a real infrastructure failure - any exception the external GitLab call happens to produce - itself, before it can propagate, and fall back instead.
  - *Depends on:* A real `cam_file_id`; a real, already-configured database connection; a real, already-configured connection to the external GitLab server.
  - *Connects to:* Its two raised exceptions propagate untouched through `download_cam_file`, below, until that function's own `except` catches them; its own internal `except Exception:` catches a real GitLab failure before it ever reaches its caller at all.
  - *Shape:* Raises `ValueError` or `FileNotFoundError` - two built-in exception types, used here to represent two distinct real domain conditions (nothing about either type is inherently domain-specific; this application's own code is what makes them one) - and, separately, catches (never raises) whatever real exception type the GitLab call happens to produce, internally, without that type ever leaving this function.

- **`download_cam_file`**
  - *What it is:* The real Flask route that calls `PDMService.download_file` and is the one place in this real call chain that actually catches whatever it raises.
  - *Implementation:* `download_cam_file(cam_file_id)`, defined at `backend/app/routes/pdm.py:95-102`, registered via `@pdm_bp.route(...)`.
  - *Its use:* This lesson's second unit treats it as the real, chosen exception boundary for this whole call chain - the one place a `try`/`except` actually appears between where an exception is raised and whoever called this route.
  - *Type:* A free function, registered as a Flask route.
  - *Responsibility:* Delegate the real work entirely to `PDMService.download_file`, and catch anything at all that function raises or lets propagate, converting it into a real, generic JSON error response.
  - *Depends on:* A real `cam_file_id` from the URL; an optional `commit_sha` query parameter; `PDMService.download_file`, above, for all of its actual behavior.
  - *Connects to:* Calls `PDMService.download_file`, above; its own `except Exception as e` is the one real boundary both of that method's raised domain exceptions travel to.
  - *Shape:* Catches every real exception type identically - `Exception`, the broadest possible type - and produces the exact same real response shape (a JSON `{'error': ...}` body, status `500`) regardless of which of the two real domain exceptions was actually raised, or whether something else entirely went wrong instead.

## Concept Unit: Propagation Is the Default; Catching Is a Choice

### The Problem

A raised exception has to end up somewhere, but nothing about Python decides where that is automatically - it keeps exiting real function after real function until something deliberately stops it. Before looking at where this real backend already does that, a small, standalone chain with nothing else going on makes the mechanism itself checkable.

Before reading on:

- In the real call chain `run_batch` calling `build_job` calling `parse_priority`, given that neither `build_job` nor `run_batch` contains a `try`/`except` anywhere in its own body, what happens to `parse_priority`'s real exception between where it's raised and wherever it's finally caught?
- When `'urgent'` (the third real priority) raises, `'high'` and `'medium'` (the first two) had already been successfully turned into real job dicts by the same list comprehension - what happens to those two already-built results once the exception propagates all the way out of `run_batch`?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch lab demonstrating propagation and a deliberately chosen exception boundary with plain Python, before looking at where this same real backend already does both.
- **Files affected:** `verification/phase-01/lab_exception_boundary.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** None - plain Python only.

### The New Code

New code, typed into a new throwaway file - the whole file at once, since there's no existing structure to return to for something this small:

**File:** `verification/phase-01/lab_exception_boundary.py` (new)

```python
def parse_priority(raw_priority):
    if raw_priority not in ("low", "medium", "high"):
        raise ValueError(f"unknown priority: {raw_priority!r}")
    return raw_priority


def build_job(raw_priority):
    return {"priority": parse_priority(raw_priority)}


def run_batch(raw_priorities):
    return [build_job(p) for p in raw_priorities]


try:
    run_batch(["high", "medium", "urgent"])
except ValueError as e:
    print(f"caught at run_batch's own caller: {e}")
```

### Mechanical Walkthrough

- `if raw_priority not in ("low", "medium", "high"): raise ValueError(f"unknown priority: {raw_priority!r}")` — Raising an exception, the real moment: a specific, named type (`ValueError`), with a real, specific message naming the actual bad value received (`!r`, basic Python, so the real value prints with its quotes) - this function contains the only `raise` in the whole real chain.
- `def build_job(raw_priority): return {"priority": parse_priority(raw_priority)}` — Calls `parse_priority` directly, with no `try`/`except` anywhere in its own body - if `parse_priority` raises, `build_job` has nothing that could catch it; the exception exits `build_job` the moment it exits `parse_priority`.
- `def run_batch(raw_priorities): return [build_job(p) for p in raw_priorities]` — The same real fact one level up - no `try`/`except` here either, inside a list comprehension (basic Python) that calls `build_job` once per real item; the first raised exception aborts the whole comprehension, not just the one item that raised it.
- `try: run_batch(["high", "medium", "urgent"]) except ValueError as e: print(...)` — The one, real, deliberately chosen exception boundary in this whole lab - three real stack frames away from where the exception was actually raised, the first place anything actually catches it.

### CS Lens

This is stack unwinding: an exception exits one real function's frame after another, in the exact reverse order those frames were entered, until something catches it. Also recognized in: a chain of nested function calls in any language with exceptions, a chain of unhandled Promise rejections in JavaScript propagating through `.then()` calls that never check for one, and a chain of method calls in Java where a checked exception is declared `throws` all the way up instead of being caught at each level.

### SE Lens

The real, honest cost of catching only at this outer boundary, in this exact shape: when `'urgent'` fails, `'high'` and `'medium'` had already been successfully turned into real job dicts by the same list comprehension - but Python's real list comprehension doesn't return a partial result; the whole expression aborts, and those two already-succeeded results are discarded along with the one that failed. Worth being precise about what "discarded" means here: nothing rolls them back - no undo happens, nothing is reverted. They simply were never returned anywhere in the first place, because the list expression that would have returned them never finished evaluating; the two real dicts existed for a moment, inside the comprehension's own machinery, and then were never referenced again once the exception left. The real alternative not chosen: catching inside the loop, per item, appending only the ones that succeed and recording which ones didn't - a genuine design tradeoff about where a boundary sits, not just whether one exists at all.

### Commands needed

- `python verification/phase-01/lab_exception_boundary.py` — Run from anywhere - this lab has no dependency on the real backend's own package layout.

### Verification

```text
caught at run_batch's own caller: unknown priority: 'urgent'
```

Full saved run: `verification/phase-01/lab_exception_boundary_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: Domain vs. Infrastructure: Real Exceptions in the Actual Backend

### The Problem

The lab above showed the mechanism with nothing else going on. This real backend already has the same shape, doubled - one function that raises more than one kind of real exception and also catches a real failure of its own internally, and a second, broader boundary in its caller that catches whatever gets past the first one, identically. Reading both closely enough shows which of the real exceptions represent a real business condition, which represents a real technical failure, and whether either real boundary can actually tell its own cases apart.

Before reading on:

- Given that `download_file` raises `ValueError` for one real condition and `FileNotFoundError` for another, and `download_cam_file` catches both with one `except Exception as e:`, what real information about which of the two actually occurred does `download_cam_file`'s own caller ever get to see?
- A real `404 Not Found` and a real `500 Internal Server Error` mean genuinely different things to whoever is calling this API. Given the real code below, which status code does every real failure from this route actually produce?

### Project Change

- **Reference Source:** `backend/app/services/pdm_service.py:162-190` (`PDMService.download_file`); `backend/app/routes/pdm.py:95-102` (`download_cam_file`) - both real, already-existing code, already read and quoted verbatim this session, shown again here for a different real question.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A
- **Dependencies:** None beyond the real repository already checked out on disk.

Both real functions have already been shown in full for their fallback behavior. Read again here, specifically for where each real `raise` and `except` actually sits, they reveal two separate real exception boundaries, not one: the first, inside `download_file` itself, catches a real infrastructure failure and never lets it propagate at all; the second, inside `download_cam_file`, is the only one either of `download_file`'s two raised domain exceptions ever actually reaches.

### The Updated Project

**File:** `backend/app/services/pdm_service.py (lines 162-190)` (already exists — read-only, nothing to type)

```python
@staticmethod
def download_file(cam_file_id, commit_sha=None):
    """Retrieves file content from GitLab (or DB fallback) for download."""
    cam_file = CAMFile.query.get(cam_file_id)
    if not cam_file:
        raise ValueError("CAM file not found")

    filename = cam_file.cam_file_original_name or f"{cam_file_id}.cam"
    file_content = None

    try:
        gitlab_service = get_gitlab_service()
        if commit_sha:
            file_content = gitlab_service.get_file_at_commit(cam_file_id, filename, commit_sha)
        else:
            file_content = gitlab_service.get_file(cam_file_id, filename)
    except Exception:
        # Fallback to local DB content if GitLab fails/not configured
        file_content = cam_file.cam_file_content

    if file_content is None:
        raise FileNotFoundError("File content not found")

    return send_file(
        io.BytesIO(file_content),
        mimetype='application/octet-stream',
        as_attachment=True,
        download_name=filename
    )
```

**File:** `backend/app/routes/pdm.py (lines 95-102)` (already exists — read-only, nothing to type)

```python
@pdm_bp.route('/cam-files/<string:cam_file_id>/download', methods=['GET'])
def download_cam_file(cam_file_id):
    """Download the current or specific version of a CAM file."""
    commit_sha = request.args.get('commit_sha')
    try:
        return PDMService.download_file(cam_file_id, commit_sha)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### Mechanical Walkthrough

- `if not cam_file: raise ValueError("CAM file not found")` — `ValueError` is a plain built-in type, not inherently a domain exception - but this application uses it here to represent a real domain condition: `cam_file_id` was a real, syntactically fine string, but no real row exists for it. The code is working exactly as designed, reporting a real fact about this specific request.
- `try: gitlab_service = get_gitlab_service() ... except Exception: file_content = cam_file.cam_file_content` — A real infrastructure exception, caught internally, right here, and never allowed to propagate at all - whatever real exception type a failed network call to GitLab actually produces, this method itself is the exception boundary for it, and it never reaches `download_cam_file`.
- `if file_content is None: raise FileNotFoundError("File content not found")` — A second built-in type, `FileNotFoundError`, used here for a second, different real domain condition - reached only if the infrastructure exception above happened and no local fallback content existed either. Still a real, meaningful business condition this application chose to represent this way, not an infrastructure failure itself.
- `@pdm_bp.route('/cam-files/<string:cam_file_id>/download', methods=['GET']) def download_cam_file(cam_file_id):` — The same real routing mechanism already established; still just one real parameter, `cam_file_id`, from the URL.
- `try: return PDMService.download_file(cam_file_id, commit_sha) except Exception as e: return jsonify({'error': str(e)}), 500` — The real, single exception boundary for this whole route - and it catches `Exception`, the broadest possible type, meaning `ValueError` and `FileNotFoundError` (two different real domain conditions) and anything else neither `download_file` nor its own internal boundary already handled all produce the exact same real response: a JSON body carrying only `str(e)`'s text, and status `500`, every single time.

### Mental Model

```text
download_file
  |
  |-- no such row --------------------> raise ValueError
  |
  |-- GitLab call fails ---> caught HERE (except Exception)
  |                          falls back to cam_file_content
  |                          |
  |                          '-- still no content -> raise FileNotFoundError
  |
  v
(ValueError / FileNotFoundError only - GitLab failure never gets this far)
  |
  v
download_cam_file
  |
  '-- except Exception as e: return jsonify({'error': str(e)}), 500
        (same 500, whichever of the two reached here)
```

### CS Lens

This is a collapsed exception boundary: multiple real, distinct exception types funneled through one catch clause broad enough to treat them identically, discarding the real distinction between them at the exact point where a caller might have used it. Also recognized in: a single `catch (Exception ex)` in C# wrapping a whole method body, a JavaScript `.catch(err => ...)` at the end of a long promise chain that never checks `err`'s real type, and a shell pipeline's trailing `|| echo 'failed'`, which can't say which command in the pipeline actually failed.

### SE Lens

The real, honest cost, visible directly in the code just shown: `ValueError` (a real, missing-resource domain condition, conventionally a `404`) and `FileNotFoundError` (a second, different real domain condition) both produce the exact same real HTTP status - `500`, conventionally reserved for the server's own unexpected failure, not a legitimate business answer like "no such file." A caller of this real API cannot distinguish "you asked for something that doesn't exist" from "this server has a genuine bug" without parsing the real error message text itself - there is no real, structured way to tell them apart from outside this function. The real alternative not chosen: catching `ValueError`/`FileNotFoundError` specifically, in `download_cam_file`, mapping each to its own real, correct status code, separately from a final, broader `except Exception` reserved for anything genuinely unexpected.

### Verification

Not applicable under the Verification Rule's own exemption: no execution is required for this unit's actual claim - that `download_file` raises two distinct real exception types and catches a third internally, and that `download_cam_file` catches all of them with one identically-broad `except`. The real code shown above, read and confirmed verbatim this session, establishes that structural claim directly. It does not establish what actually happens on a live request - whether a real GitLab failure actually occurs, what real status a real client actually receives - which would need a separate execution trace, not a citation.

### Connection to the previous unit

The unit above built a small, standalone chain to see propagation and a chosen boundary with nothing else going on; this unit read the real backend's own version of the same shape, and found two real boundaries instead of one - an inner one that already separates a real infrastructure failure out, and an outer one still too broad to tell its own two real domain conditions apart.

## Connect the pieces

One small, real call chain, three functions deep, one exception, one deliberately placed `try`/`except` - then the same real shape already at work in the actual backend, except doubled: inside `PDMService.download_file`, a real infrastructure exception is caught and never leaves; only that function's own two real domain exceptions ever reach `download_cam_file`'s single, indiscriminate `except Exception`, which produces the exact same `500` response no matter which of the two actually happened.

**Next lesson:** What decides which real files a function's own dependencies come from at all - how a project's real files are organized into modules and packages, and what happens when two of them need each other.