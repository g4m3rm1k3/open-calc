# Lesson 0.4: Reading an Existing Backend

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, small tool that finds every route in a real backend file by parsing it as a real Abstract Syntax Tree, instead of reading the file by eye - then a real, fully shown trace of one request that leaves this application entirely, reaches a different real server, and falls back to a database when that server doesn't answer. The transferable problem: investigating a backend you didn't write means finding real, verifiable facts about it mechanically, not trusting a docstring, a filename, or a guess about what a function probably does.

**What you need to know first:** A request/response pipeline with named stages; reading a real, existing file as evidence; a real, documented architectural boundary violation in this exact application.

## Terms used in this lesson

- **Abstract Syntax Tree (AST)** — A tree structure representing a program's real grammatical structure - which function contains which decorator, which call has which arguments - built by parsing source code without running it. It exists so a program's own shape can be inspected mechanically and exactly, the same way every time, instead of a person reading it by eye and possibly missing something.
- **Static analysis** — Examining what source code says, structurally, without executing it. It exists as a distinct approach from watching a program actually run (a real execution trace, like a debugger or `CodeLens`'s own Pyodide-based tracer) - static analysis can find every route a file defines even for code paths that never actually run during any single execution.
- **Decorator** — Python syntax (`@something`) that wraps a function in another piece of behavior without changing the function's own body. It exists so "register this function as a route handler" can be stated once, directly above the function it applies to, instead of a separate registration call elsewhere in the file.
- **Static method** — A method attached to a class for organizational purposes, but that doesn't receive the instance (`self`) at all and doesn't need one to do its job - marked with the `@staticmethod` decorator. It exists so a function that's conceptually "part of" a class (grouped with related behavior) but doesn't need any per-instance state can say so plainly, rather than accepting an unused `self` parameter it would never use.
- **Query parameter** — A real piece of data attached to a URL after a `?`, as `name=value` pairs - not part of the path itself. It exists so a request can carry optional, named extra information (which commit to fetch, which page to show) without that information changing which route handles the request at all.
- **Raising an exception** — Deliberately signaling that something has gone wrong, using Python's `raise` statement with a specific, named exception type - `ValueError`, `FileNotFoundError` - rather than a generic, unnamed failure. It exists so calling code (or, ultimately, a route's own `except` block) can distinguish *what kind* of problem occurred and decide what to do about it, rather than only knowing that *something* did.
- **Fallback** — A backup behavior that runs only when a primary approach fails or is unavailable. It exists so a real failure in one dependency (a network call to a different real server) doesn't necessarily mean the whole request fails, if a real, working alternative exists.

## Objects and methods used

- **`ast.parse`**
  - *What it is:* A standard-library function that parses real Python source text into a real Abstract Syntax Tree.
  - *Implementation:* `ast.parse(source: str) -> ast.Module`
  - *Its use:* This lesson's lab calls it on `pdm.py`'s real, actual source text to get a real, inspectable tree instead of reading the file as plain text.
  - *Type:* A free function, in Python's standard library `ast` module.
  - *Responsibility:* Parse the given source text according to Python's real grammar and return the root of a real, structured tree representing it - not a guess or an approximation, the same structure Python's own compiler builds internally.
  - *Depends on:* Syntactically valid Python source text.
  - *Connects to:* Its return value is walked by `ast.walk`, below.
  - *Shape:* The entry point of Python's own real static-analysis seam - everything else in this unit inspects the tree this function builds.

- **`ast.walk`**
  - *What it is:* A standard-library function that visits every node in a tree, in no particular guaranteed order, one at a time.
  - *Implementation:* `ast.walk(node: ast.AST) -> Iterator[ast.AST]`
  - *Its use:* This lesson's lab uses it to visit every node in the whole file's tree, checking each one to see if it's a function definition worth inspecting further.
  - *Type:* A free function, returning a real Python generator.
  - *Responsibility:* Yield every node reachable from the given root node exactly once, so calling code doesn't have to write its own recursive tree-walking logic.
  - *Depends on:* A real AST node, typically the `Module` `ast.parse` returned.
  - *Connects to:* Called on `ast.parse`'s return value; each yielded node is checked with `isinstance` against `ast.FunctionDef`, below.
  - *Shape:* A traversal utility sitting on top of the tree `ast.parse` builds - it doesn't change the tree, only visits it.

- **`ast.FunctionDef`**
  - *What it is:* The real AST node type representing one function definition.
  - *Implementation:* A class with real fields (`'name'`, `'args'`, `'body'`, `'decorator_list'`, `'returns'`, `'type_comment'`, `'type_params'`), confirmed this session via `ast.FunctionDef._fields` against the installed Python's real `ast` module.
  - *Its use:* This lesson's lab checks `isinstance(node, ast.FunctionDef)` to find real function definitions, then reads both its `name` and `decorator_list` fields.
  - *Type:* A class (an `ast.AST` subclass).
  - *Responsibility:* Represent, as real structured data, everything about one function definition the parser found - its name, its parameters, its body, and every decorator applied to it.
  - *Depends on:* Being produced by `ast.parse` - never constructed directly by this lesson's own code.
  - *Connects to:* Its `decorator_list` field (a real list) is iterated to find route decorators, below; its `name` field is read directly for printing.
  - *Shape:* One node type in the real tree `ast.parse` builds - the specific one this lesson's lab is actually looking for.

- **`ast.Call`**
  - *What it is:* The real AST node type representing one function or method call.
  - *Implementation:* A class with real fields (`'func'`, `'args'`, `'keywords'`), confirmed this session via `ast.Call._fields`.
  - *Its use:* Each decorator in a real `decorator_list` is checked with `isinstance(dec, ast.Call)`, since a decorator written as `@bp.route(...)` is itself a real call expression, not a bare name.
  - *Type:* A class (an `ast.AST` subclass).
  - *Responsibility:* Represent, as real structured data, what's being called (`func`), what positional arguments were given (`args`), and what keyword arguments were given (`keywords`).
  - *Depends on:* Being produced by `ast.parse`, appearing wherever the real source contains a call expression.
  - *Connects to:* Its `func` field is checked against `ast.Attribute`, below; its `args` field is indexed to read the real route path.
  - *Shape:* The node type that makes `@bp.route(...)` different, in the tree, from a bare decorator like `@staticmethod`.

- **`ast.Attribute`**
  - *What it is:* The real AST node type representing one dotted attribute access, like `bp.route`.
  - *Implementation:* A class with real fields (`'value'`, `'attr'`, `'ctx'`), confirmed this session via `ast.Attribute._fields`.
  - *Its use:* A `Call`'s `func` field, for `@bp.route(...)`, is itself an `Attribute` node - this lesson's lab reads its `attr` field to check the accessed name is literally `'route'`, not some other method.
  - *Type:* A class (an `ast.AST` subclass).
  - *Responsibility:* Represent, as real structured data, the object an attribute is being accessed on (`value`) and the real name of the attribute being accessed (`attr`).
  - *Depends on:* Being produced by `ast.parse` wherever the real source contains a dotted access.
  - *Connects to:* Read from a `Call`'s `func` field, above; its own `attr` field is compared against the literal string `'route'`.
  - *Shape:* The node type distinguishing `bp.route` from a plain name like `route` alone.

- **`ast.Constant`**
  - *What it is:* The real AST node type representing one literal value written directly in the source - a string, a number, a bare `True`/`False`/`None`.
  - *Implementation:* A class with real fields (`'value'`, `'kind'`), confirmed this session via `ast.Constant._fields`.
  - *Its use:* The real route path string, `'/cam-files/<string:cam_file_id>/download'`, is parsed as a `Constant` node; this lesson's lab reads its `value` field to get the real path back out as a plain Python string.
  - *Type:* A class (an `ast.AST` subclass).
  - *Responsibility:* Represent, as real structured data, one literal value exactly as written in the source, with `value` holding the real, already-converted Python value.
  - *Depends on:* Being produced by `ast.parse` wherever the real source contains a literal.
  - *Connects to:* Read from a `Call`'s first `args` entry; its `value` is what actually gets printed.
  - *Shape:* The node type turning source text like `'/download'` into a real, usable Python string, rather than a further sub-tree.

- **`Blueprint.route`**
  - *What it is:* A method registering a URL rule on a Blueprint and returning a decorator for the function that handles it.
  - *Implementation:* `route(rule: str, methods: list[str] = ["GET"])` - called here as `@pdm_bp.route('/cam-files/<string:cam_file_id>/download', methods=['GET'])`.
  - *Its use:* This is what makes `download_cam_file` reachable over HTTP at all - the same real mechanism already proven, this time on the real `pdm_bp` blueprint.
  - *Type:* An instance method, used via decorator syntax.
  - *Responsibility:* Record 'this rule, these methods, call this function' against the blueprint it was called on.
  - *Depends on:* A path string, an explicit or default method list, and the function it decorates.
  - *Connects to:* Called by `pdm.py`'s own module-level code at import time; consulted by Flask on every incoming request to this path.
  - *Shape:* The same routing seam already proven real, applied here to a route that itself delegates entirely to a service.

- **`request.args.get`**
  - *What it is:* A method reading one real query parameter (Terms, above) from the current request, by name, returning `None` if it wasn't given.
  - *Implementation:* `request.args.get(key: str) -> str | None` - called here as `request.args.get('commit_sha')`.
  - *Its use:* `download_cam_file` reads an optional `commit_sha` query parameter this way, so a caller can ask for a specific historical version instead of always getting the latest.
  - *Type:* An instance method on Flask's real `request.args`, a dict-like object.
  - *Responsibility:* Look up the given key among the real query parameters attached to the current request's URL, returning the real string value if present, `None` if it wasn't given at all.
  - *Depends on:* Being called during a real request - `request` is only meaningfully populated while handling one.
  - *Connects to:* Its result, `commit_sha`, is passed straight into `PDMService.download_file`, below.
  - *Shape:* The real seam between 'what's in the URL' and 'a plain Python value a route handler can use directly'.

- **`jsonify`**
  - *What it is:* A Flask function converting a Python value into a real HTTP response with a correct `application/json` `Content-Type`.
  - *Implementation:* `flask.jsonify(*args, **kwargs) -> Response`
  - *Its use:* `download_cam_file`'s own `except` block uses it to turn a caught error's message into a real JSON error response, `{'error': str(e)}`, with a real `500` status code.
  - *Type:* A free function.
  - *Responsibility:* Serialize the given value to JSON text and wrap it in a response object with the correct header set.
  - *Depends on:* A JSON-serializable Python value.
  - *Connects to:* Called only on the error path here; the success path returns whatever `PDMService.download_file` itself returns instead.
  - *Shape:* The same Python-value-to-HTTP-response seam already proven real, used here specifically for an error response.

- **`PDMService.download_file`**
  - *What it is:* A real static method holding the entire actual behavior behind downloading a CAM file - the real database read, the real external attempt, and the real fallback.
  - *Implementation:* `PDMService.download_file(cam_file_id: str, commit_sha: str | None = None)`, defined at `backend/app/services/pdm_service.py:162-190`.
  - *Its use:* `download_cam_file` (the route) does nothing except call this and catch whatever it raises - this method is where the real work actually happens.
  - *Type:* A static method (Terms, above) on the `PDMService` class.
  - *Responsibility:* Given a real CAM file's id and an optional specific commit, produce a real, downloadable HTTP response carrying that file's real content - trying a different real server first, falling back to this application's own locally stored copy if that attempt fails, and raising a specific, named exception (Terms, above) for either 'no such file' or 'no content anywhere.'
  - *Depends on:* A real `cam_file_id`; a real, already-configured database connection; a real, already-configured connection to the external GitLab server this application depends on.
  - *Connects to:* Called by `download_cam_file`, above; calls `CAMFile.query.get` and `get_gitlab_service`, below, and returns whatever `send_file`, below, builds.
  - *Shape:* The real service-layer boundary this route delegates to entirely - all the real decisions live here, not in the route itself.

- **`CAMFile.query.get`**
  - *What it is:* A real ORM query reading one row from the database by its primary key.
  - *Implementation:* `Model.query.get(primary_key) -> Model | None` - called here as `CAMFile.query.get(cam_file_id)`.
  - *Its use:* `download_file` uses it to load the real, persisted `CAMFile` row this request is about, before doing anything else.
  - *Type:* A class-level attribute (`query`) whose own `get` method is called on it - provided by Flask-SQLAlchemy, not written by this application.
  - *Responsibility:* Look up one real row in the real database by its primary key and return it as a real Python object, or `None` if no such row exists.
  - *Depends on:* A real, already-configured database connection - already true throughout this real application.
  - *Connects to:* Its result, `cam_file`, is read from repeatedly below (`cam_file_original_name`, `cam_file_content`).
  - *Shape:* The real persistence boundary - how an ORM works in full, and what `query` actually is, is developed properly elsewhere in this curriculum's own database-focused material; here it's simply the real, working seam this method already crosses.

- **`get_gitlab_service`**
  - *What it is:* A real function returning a configured client for talking to a different, real, external GitLab server.
  - *Implementation:* `get_gitlab_service() -> GitLabService`, defined in `backend/app/services/gitlab_service.py`.
  - *Its use:* `download_file` calls it to get a real handle it can ask for this file's content, stored on that separate real server rather than in this application's own database.
  - *Type:* A free function.
  - *Responsibility:* Build and return a real object able to make real network calls to a real, external GitLab instance on this application's behalf.
  - *Depends on:* Real, already-configured GitLab credentials/URL, already present in this application's own configuration.
  - *Connects to:* Its return value's `get_file_at_commit`/`get_file` methods are what actually reach across the network; both can genuinely fail.
  - *Shape:* The real boundary where this backend stops being only a server and becomes a client itself, of a different real server it doesn't control.

- **`send_file`**
  - *What it is:* A Flask function building a real HTTP response whose body is a file's actual binary content.
  - *Implementation:* `flask.send_file(path_or_file, mimetype: str, as_attachment: bool, download_name: str) -> Response`
  - *Its use:* `download_file`'s own final line uses it to turn the real bytes it found - from GitLab or from the local database fallback - into a real, downloadable HTTP response.
  - *Type:* A free function.
  - *Responsibility:* Build a real response carrying the given bytes, with the given MIME type and filename, and (when `as_attachment` is true) the real headers telling a browser to download rather than display it.
  - *Depends on:* A real, already-available source of bytes - here, an `io.BytesIO` wrapping the real file content already found.
  - *Connects to:* Called once, as the real final step of a successful `download_file` call - whichever earlier branch (GitLab or fallback) supplied `file_content`.
  - *Shape:* The same real Python-value-to-HTTP-response family as `jsonify`, specialized for real binary file content instead of JSON.

## Concept Unit: Finding Every Route Mechanically

### The Problem

`pdm.py`'s own docstring lists six endpoints. A docstring is a comment - nothing checks it stays true as the file changes. A more reliable way to answer "what routes does this file actually define" would parse the real source itself, not trust a summary written about it.

Before reading on:

- Given that a decorator like `@bp.route(...)` is itself a real function call, what real, structured piece of information would you expect Python's own parser to already have about it, before any code you write even looks at it?
- If a docstring and the real code ever disagreed, which one would you trust, and why?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch investigation tool, run against `backend/app/routes/pdm.py`'s real, current source (already partly quoted in this curriculum's own investigation: six real routes, all delegating to `PDMService`).
- **Files affected:** `verification/phase-00/lab_find_routes.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's standard library `ast` module only.

`pdm.py`'s real docstring (already read this session) claims six endpoints by name. Rather than trust that comment, this unit builds a small, real tool that answers the same question by parsing the file's actual source - so the answer stays correct even if the docstring is ever wrong or goes stale.

### The New Code

New code, typed into a new throwaway file - the whole file at once, since there's no existing structure to return to for something this small:

**File:** `verification/phase-00/lab_find_routes.py` (new)

```python
import ast

source = open("backend/app/routes/pdm.py").read()
tree = ast.parse(source)

for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef):
        for dec in node.decorator_list:
            if isinstance(dec, ast.Call) and isinstance(dec.func, ast.Attribute) and dec.func.attr == "route":
                path = dec.args[0].value
                print(f"{node.name}: {path}")
```

### The Updated Project

Not applicable - the code shown above is already the whole new structure, with nothing existing to return to (per this schema's own skip condition for a brand-new file).

### Mechanical Walkthrough

- `source = open("backend/app/routes/pdm.py").read()` — Reads the real, current text of the real file this lesson is investigating - `open()` and `.read()` are ordinary Python, assumed prior knowledge; nothing here is Flask- or backend-specific yet.
- `tree = ast.parse(source)` — Calls `ast.parse` (full treatment above) on that real text, producing a real `ast.Module` - the root of the whole file's parsed structure, assigned to `tree`.
- `for node in ast.walk(tree):` — Calls `ast.walk` (full treatment above) on that root, and iterates every node it yields, one at a time, checking each one in turn.
- `if isinstance(node, ast.FunctionDef):` — `isinstance` is ordinary Python, assumed prior knowledge; `ast.FunctionDef` (full treatment above) is the real node type this check is looking for - most nodes `ast.walk` yields are something else (a `Call`, a `Name`, a `Constant`) and get skipped here.
- `for dec in node.decorator_list:` — Reads the real `decorator_list` field (full treatment under `ast.FunctionDef`, above) - a real list, since a function can have more than one decorator - and checks each one.
- `isinstance(dec, ast.Call) and isinstance(dec.func, ast.Attribute) and dec.func.attr == "route"` — Three real conditions, all required: the decorator is itself a call (`ast.Call`, full treatment above - true for `@bp.route(...)`, false for a bare decorator like `@staticmethod`); the thing being called is a dotted attribute access (`ast.Attribute`, full treatment above - true for `bp.route`, false for a bare name); and the real attribute name accessed is literally the string `"route"`, not some other method name that happens to also be called as a decorator.
- `path = dec.args[0].value` — Reads the first positional argument of the real call - a real `ast.Constant` node (full treatment above) - and its `value` field, giving back the real route path as a plain Python string, exactly as it's written in `pdm.py`'s own source.
- `print(f"{node.name}: {path}")` — Prints the real function's name (`FunctionDef.name`, full treatment above) alongside the real path just extracted - an f-string, already-assumed prior Python knowledge.

### CS Lens

This is static analysis (Terms, above): extracting real facts about a program from its own structure, without running it. Also recognized in: a linter flagging an unused variable before the program ever executes, a compiler's own type-checking pass, and an IDE's "find all usages" feature - all of them answer real questions about code by reading its structure, never by running it and watching what happens.

### SE Lens

The real alternative this lesson's lab avoids: trusting `pdm.py`'s own docstring, which lists six endpoints as a comment with nothing checking it against the real code. The real, honest cost of the alternative actually used here: this script only finds routes shaped exactly like `@blueprint_name.route(...)` - a route registered a different real way in this same codebase (`app.route(...)` directly on the app object, already seen characterizing this app's own health-check duplication) would be missed by this exact script as written, and would need its own real check added.

### Commands needed

- `python verification/phase-00/lab_find_routes.py` — Run from the manufacturing-platform repository root, so the relative path to backend/app/routes/pdm.py resolves correctly.

### Verification

```text
checkout_cam_file: /cam-files/<string:cam_file_id>/checkout
checkin_cam_file: /cam-files/<string:cam_file_id>/checkin
cancel_checkout: /cam-files/<string:cam_file_id>/cancel-checkout
admin_unlock: /cam-files/<string:cam_file_id>/admin-unlock
get_history: /cam-files/<string:cam_file_id>/history
download_cam_file: /cam-files/<string:cam_file_id>/download
```

Full saved run: `verification/phase-00/lab_find_routes_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: Tracing One Real Request Through an External Service

### The Problem

The pipeline traced so far (an earlier, separate real request) never left this application's own process - the database it touched was local, and nothing outside this codebase was involved. Real backends often depend on other real servers they don't control. Before reading on: given that a real network call to a different real server can fail for reasons this application has no control over, what would you want to happen to a request that depends on one, if that other server doesn't answer?

Before reading on:

- If a real request depends on a different real server that's temporarily unreachable, what real options does this application actually have - and which one would you choose for a file that might already exist locally?

### Project Change

- **Reference Source:** `backend/app/routes/pdm.py:95-102` (`download_cam_file`); `backend/app/services/pdm_service.py:162-190` (`PDMService.download_file`) - both real, already-existing files, read and quoted verbatim this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A
- **Dependencies:** None beyond the real repository already checked out on disk.

`download_cam_file` (below) is the same real route the unit above's own tool already found and printed - now shown in full instead of just named. It does almost nothing itself: it reads one query parameter and immediately delegates to `PDMService.download_file`, which is where the real behavior actually lives - a real database read, a real attempt to reach a different real server, and a real fallback when that attempt fails.

### The New Code

There is no new code in this unit - both real files below already exist. Nothing here gets typed.

### The Updated Project

**File:** `backend/app/routes/pdm.py` (already exists — read-only, nothing to type)

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

**File:** `backend/app/services/pdm_service.py` (already exists — read-only, nothing to type)

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

### Mechanical Walkthrough

- `@pdm_bp.route('/cam-files/<string:cam_file_id>/download', methods=['GET'])` — `Blueprint.route` (full treatment above), the same real routing mechanism already proven - this is the exact route the unit above's own tool found and printed.
- `commit_sha = request.args.get('commit_sha')` — `request.args.get` (full treatment above) reads an optional query parameter (Terms, above); if a caller doesn't supply one, `commit_sha` is `None`, which matters shortly, in `download_file`.
- `try: return PDMService.download_file(cam_file_id, commit_sha) except Exception as e: return jsonify({'error': str(e)}), 500` — The route's own entire job is one delegated call, wrapped in a `try`/`except` - if `download_file` raises anything at all, this catches it and returns a real JSON error response (`jsonify`, full treatment above) with a real `500` status, rather than letting the real exception crash the request unhandled.
- `@staticmethod` — A static method (Terms, above) - `download_file` doesn't use `self`, since it needs nothing from any particular `PDMService` instance to do its job.
- `cam_file = CAMFile.query.get(cam_file_id)` — `CAMFile.query.get` (full treatment above) reads the real, persisted row this request is about, by its real primary key.
- `if not cam_file: raise ValueError("CAM file not found")` — Raising an exception (Terms, above) with a specific, named type - `ValueError` - the moment the real database lookup came back empty, rather than continuing with a `cam_file` that doesn't actually exist.
- `filename = cam_file.cam_file_original_name or f"{cam_file_id}.cam"` — Reads the real file's own stored original name, falling back to a generated one built from the real `cam_file_id` if none was ever recorded - ordinary Python `or`, already assumed prior knowledge.
- `try: gitlab_service = get_gitlab_service() ... except Exception: file_content = cam_file.cam_file_content` — The real fallback (Terms, above) this whole unit is about: `get_gitlab_service` (full treatment above) is called, and either `get_file_at_commit` or `get_file` is used depending on whether a specific `commit_sha` was given - both are real network calls to a different real server, and both can genuinely fail for reasons this application doesn't control. The bare `except Exception:` catches any such failure and assigns `cam_file.cam_file_content` instead - the same real file's content, already stored locally in this application's own database, read directly off the `cam_file` object already fetched above.
- `if file_content is None: raise FileNotFoundError("File content not found")` — A second, different raised exception type (Terms, above) - this one specifically for "neither GitLab nor the local fallback actually had any content," which is a genuinely different real situation than "the row doesn't exist at all," caught above.
- `return send_file(io.BytesIO(file_content), mimetype='application/octet-stream', as_attachment=True, download_name=filename)` — `send_file` (full treatment above) builds the real, downloadable HTTP response - `io.BytesIO` (Python's standard library, wrapping the real bytes so `send_file` can read them as if from a real file) - carrying whichever real content actually ended up in `file_content`, GitLab's or the local fallback's, with no difference visible to whoever downloads it.

### CS Lens

This is graceful degradation: a system continuing to provide a real, useful (if reduced) result when part of it fails, rather than failing the whole operation outright. Also recognized in: a video call dropping to audio-only when video bandwidth isn't available, a web page serving a cached version when its live data source times out, and a GPS app falling back to a previously downloaded map when it loses signal.

### SE Lens

The real alternative not chosen: `download_file` could have let a GitLab failure propagate as a real error, forcing every caller to handle "the file exists, but you can't have it right now." Instead, the bare `except Exception:` shown above catches any real failure from `gitlab_service` and falls back to `cam_file.cam_file_content` - the same file's content, already stored locally. The real, honest cost, visible directly in the code just shown: catching a bare `Exception` also silently swallows a real bug inside the GitLab integration itself, not only a genuine network failure - this application currently cannot tell those two situations apart from this code alone.

### Commands needed

None.

### Verification

Not applicable under the Verification Rule's own exemption: both files shown above are quoted verbatim from real, already-existing source, read this session - there is no execution to run; the code itself is the evidence.

### Connection to the previous unit

The unit above built a mechanical way to find every real route in a file; this unit showed the real code behind one of those routes in full, all the way through a real external service and its real, local fallback.

## Connect the pieces

One real route, found two ways: first mechanically, by the AST tool built in the unit above, listing `download_cam_file` among five others directly from `pdm.py`'s real, parsed structure; then shown and walked through directly - `GET /cam-files/<id>/download` reaches `download_cam_file` (`pdm.py:95-102`), which calls `PDMService.download_file` (`pdm_service.py:162-190`), which tries a real call to a different real server through `gitlab_service`, and falls back to this application's own locally stored copy the moment that real call fails - a real request that only makes sense once both "what routes exist" and "what the code behind them actually does" are investigated with real evidence, not assumed from either the file's name or its docstring.

**Next lesson:** Applying everything learned so far about backend engineering concepts to the Python language itself, starting with functions as the real unit backend code is organized around.