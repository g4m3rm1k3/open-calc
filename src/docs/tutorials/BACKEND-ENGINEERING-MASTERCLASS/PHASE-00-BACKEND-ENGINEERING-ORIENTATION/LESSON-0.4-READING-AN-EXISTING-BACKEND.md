# Lesson 0.4: Reading an Existing Backend

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, small tool that finds every route in a real backend file by parsing it as a real Abstract Syntax Tree, instead of reading the file by eye - then a real trace of one request that leaves this application entirely, reaches a different real server, and falls back to a database when that server doesn't answer. The transferable problem: investigating a backend you didn't write means finding real, verifiable facts about it mechanically, not trusting a docstring, a filename, or a guess about what a function probably does.

**What you need to know first:** A request/response pipeline with named stages; reading a real, existing file as evidence; a real, documented architectural boundary violation in this exact application.

## Terms used in this lesson

- **Abstract Syntax Tree (AST)** — A tree structure representing a program's real grammatical structure - which function contains which decorator, which call has which arguments - built by parsing source code without running it. It exists so a program's own shape can be inspected mechanically and exactly, the same way every time, instead of a person reading it by eye and possibly missing something.
- **Static analysis** — Examining what source code says, structurally, without executing it. It exists as a distinct approach from watching a program actually run (a real execution trace, like a debugger or CodeLens's own Pyodide-based tracer) - static analysis can find every route a file defines even for code paths that never actually run during any single execution.
- **Decorator** — Python syntax (`@something`) that wraps a function in another piece of behavior without changing the function's own body. It exists so "register this function as a route handler" can be stated once, directly above the function it applies to, instead of a separate registration call elsewhere in the file.
- **Fallback** — A backup behavior that runs only when a primary approach fails or is unavailable. It exists so a real failure in one dependency (a network call to a different real server) doesn't necessarily mean the whole request fails, if a real, working alternative exists.

## Objects and methods used

- **`ast.parse`**
  - *What it is:* A standard-library function that parses real Python source text into a real Abstract Syntax Tree.
  - *Implementation:* ast.parse(source: str) -> ast.Module
  - *Its use:* This lesson's lab calls it on pdm.py's real, actual source text to get a real, inspectable tree instead of reading the file as plain text.
  - *Type:* A free function, in Python's standard library `ast` module.
  - *Responsibility:* Parse the given source text according to Python's real grammar and return the root of a real, structured tree representing it - not a guess or an approximation, the same structure Python's own compiler builds internally.
  - *Depends on:* Syntactically valid Python source text.
  - *Connects to:* Its return value is walked by ast.walk, below.
  - *Shape:* The entry point of Python's own real static-analysis seam - everything else in this unit inspects the tree this function builds.

- **`ast.walk`**
  - *What it is:* A standard-library function that visits every node in a tree, in no particular guaranteed order, one at a time.
  - *Implementation:* ast.walk(node: ast.AST) -> Iterator[ast.AST]
  - *Its use:* This lesson's lab uses it to visit every node in the whole file's tree, checking each one to see if it's a function definition worth inspecting further.
  - *Type:* A free function, returning a real Python generator.
  - *Responsibility:* Yield every node reachable from the given root node exactly once, so calling code doesn't have to write its own recursive tree-walking logic.
  - *Depends on:* A real AST node, typically the Module ast.parse returned.
  - *Connects to:* Called on ast.parse's return value; each yielded node is checked with isinstance against ast.FunctionDef, below.
  - *Shape:* A traversal utility sitting on top of the tree ast.parse builds - it doesn't change the tree, only visits it.

- **`ast.FunctionDef`**
  - *What it is:* The real AST node type representing one function definition.
  - *Implementation:* A class with real fields ('name', 'args', 'body', 'decorator_list', 'returns', 'type_comment', 'type_params'), confirmed this session via ast.FunctionDef._fields against the installed Python's real ast module.
  - *Its use:* This lesson's lab checks isinstance(node, ast.FunctionDef) to find real function definitions, then reads both its name and decorator_list fields.
  - *Type:* A class (an ast.AST subclass).
  - *Responsibility:* Represent, as real structured data, everything about one function definition the parser found - its name, its parameters, its body, and every decorator applied to it.
  - *Depends on:* Being produced by ast.parse - never constructed directly by this lesson's own code.
  - *Connects to:* Its decorator_list field (a real list) is iterated to find route decorators, below; its name field is read directly for printing.
  - *Shape:* One node type in the real tree ast.parse builds - the specific one this lesson's lab is actually looking for.

- **`ast.Call`**
  - *What it is:* The real AST node type representing one function or method call.
  - *Implementation:* A class with real fields ('func', 'args', 'keywords'), confirmed this session via ast.Call._fields.
  - *Its use:* Each decorator in a real decorator_list is checked with isinstance(dec, ast.Call), since a decorator written as `@bp.route(...)` is itself a real call expression, not a bare name.
  - *Type:* A class (an ast.AST subclass).
  - *Responsibility:* Represent, as real structured data, what's being called (func), what positional arguments were given (args), and what keyword arguments were given (keywords).
  - *Depends on:* Being produced by ast.parse, appearing wherever the real source contains a call expression.
  - *Connects to:* Its func field is checked against ast.Attribute, below; its args field is indexed to read the real route path.
  - *Shape:* The node type that makes `@bp.route(...)` different, in the tree, from a bare decorator like `@staticmethod`.

- **`ast.Attribute`**
  - *What it is:* The real AST node type representing one dotted attribute access, like `bp.route`.
  - *Implementation:* A class with real fields ('value', 'attr', 'ctx'), confirmed this session via ast.Attribute._fields.
  - *Its use:* A Call's func field, for `@bp.route(...)`, is itself an Attribute node - this lesson's lab reads its attr field to check the accessed name is literally 'route', not some other method.
  - *Type:* A class (an ast.AST subclass).
  - *Responsibility:* Represent, as real structured data, the object an attribute is being accessed on (value) and the real name of the attribute being accessed (attr).
  - *Depends on:* Being produced by ast.parse wherever the real source contains a dotted access.
  - *Connects to:* Read from a Call's func field, above; its own attr field is compared against the literal string 'route'.
  - *Shape:* The node type distinguishing `bp.route` from a plain name like `route` alone.

- **`ast.Constant`**
  - *What it is:* The real AST node type representing one literal value written directly in the source - a string, a number, a bare True/False/None.
  - *Implementation:* A class with real fields ('value', 'kind'), confirmed this session via ast.Constant._fields.
  - *Its use:* The real route path string, `'/cam-files/<string:cam_file_id>/download'`, is parsed as a Constant node; this lesson's lab reads its value field to get the real path back out as a plain Python string.
  - *Type:* A class (an ast.AST subclass).
  - *Responsibility:* Represent, as real structured data, one literal value exactly as written in the source, with value holding the real, already-converted Python value.
  - *Depends on:* Being produced by ast.parse wherever the real source contains a literal.
  - *Connects to:* Read from a Call's first args entry; its value is what actually gets printed.
  - *Shape:* The node type turning source text like `'/download'` into a real, usable Python string, rather than a further sub-tree.

## Concept Unit: Finding Every Route Mechanically

### The Problem

pdm.py's own docstring lists six endpoints. A docstring is a comment - nothing checks it stays true as the file changes. A more reliable way to answer "what routes does this file actually define" would parse the real source itself, not trust a summary written about it.

Before reading on:

- Given that a decorator like @bp.route(...) is itself a real function call, what real, structured piece of information would you expect Python's own parser to already have about it, before any code you write even looks at it?
- If a docstring and the real code ever disagreed, which one would you trust, and why?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch investigation tool, run against `backend/app/routes/pdm.py`'s real, current source (already partly quoted in this curriculum's own investigation: six real routes, all delegating to `PDMService`).
- **Files affected:** `verification/phase-00/lab_find_routes.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's standard library ast module only.

### The New Code

New code, typed into a new throwaway file, verification/phase-00/lab_find_routes.py:

```python
import ast

source = open("backend/app/routes/pdm.py").read()
tree = ast.parse(source)
```

### The Updated Project

The same file from the step above; everything from the for loop onward is new, typed in now, marked below:

**File:** `verification/phase-00/lab_find_routes.py`

```python
import ast

source = open("backend/app/routes/pdm.py").read()
tree = ast.parse(source)

for node in ast.walk(tree):                                      # <- new
    if isinstance(node, ast.FunctionDef):                        # <- new
        for dec in node.decorator_list:                          # <- new
            if isinstance(dec, ast.Call) and isinstance(dec.func, ast.Attribute) and dec.func.attr == "route":  # <- new
                path = dec.args[0].value                         # <- new
                print(f"{node.name}: {path}")                    # <- new
```

### Mechanical Walkthrough

- `source = open("backend/app/routes/pdm.py").read()` — Reads the real, current text of the real file this lesson is investigating - open() and .read() are ordinary Python, assumed prior knowledge; nothing here is Flask- or backend-specific yet.
- `tree = ast.parse(source)` — Calls ast.parse (full treatment above) on that real text, producing a real ast.Module - the root of the whole file's parsed structure, assigned to tree.
- `for node in ast.walk(tree):` — Calls ast.walk (full treatment above) on that root, and iterates every node it yields, one at a time, checking each one in turn.
- `if isinstance(node, ast.FunctionDef):` — isinstance is ordinary Python, assumed prior knowledge; ast.FunctionDef (full treatment above) is the real node type this check is looking for - most nodes ast.walk yields are something else (a Call, a Name, a Constant) and get skipped here.
- `for dec in node.decorator_list:` — Reads the real decorator_list field (full treatment under ast.FunctionDef, above) - a real list, since a function can have more than one decorator - and checks each one.
- `isinstance(dec, ast.Call) and isinstance(dec.func, ast.Attribute) and dec.func.attr == "route"` — Three real conditions, all required: the decorator is itself a call (ast.Call, full treatment above - true for @bp.route(...), false for a bare decorator like @staticmethod); the thing being called is a dotted attribute access (ast.Attribute, full treatment above - true for bp.route, false for a bare name); and the real attribute name accessed is literally the string "route", not some other method name that happens to also be called as a decorator.
- `path = dec.args[0].value` — Reads the first positional argument of the real call - a real ast.Constant node (full treatment above) - and its value field, giving back the real route path as a plain Python string, exactly as it's written in pdm.py's own source.
- `print(f"{node.name}: {path}")` — Prints the real function's name (FunctionDef.name, full treatment above) alongside the real path just extracted - an f-string, already-assumed prior Python knowledge.

### CS Lens

This is static analysis (Terms, above): extracting real facts about a program from its own structure, without running it. Also recognized in: a linter flagging an unused variable before the program ever executes, a compiler's own type-checking pass, and an IDE's "find all usages" feature - all of them answer real questions about code by reading its structure, never by running it and watching what happens.

### SE Lens

The real alternative this lesson's lab avoids: trusting pdm.py's own docstring, which lists six endpoints as a comment with nothing checking it against the real code. The real, honest cost of the alternative actually used here: this script only finds routes shaped exactly like `@blueprint_name.route(...)` - a route registered a different real way in this same codebase (`app.route(...)` directly on the app object, already seen characterizing this app's own health-check duplication) would be missed by this exact script as written, and would need its own real check added.

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

- **Reference Source:** `backend/app/routes/pdm.py:95-102` (`download_cam_file`); `backend/app/services/pdm_service.py:162-189` (`PDMService.download_file`); `backend/app/services/gitlab_service.py` (`get_gitlab_service`) - all real, already-existing files, read and quoted verbatim this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A
- **Dependencies:** None beyond the real repository already checked out on disk.

### The New Code

There is no new code in this unit - every file named below already exists. Nothing here gets typed.

### The Updated Project

Not applicable - this unit cites a real, existing request path rather than building anything new.

### Mechanical Walkthrough

Not applicable - real citations follow in place of a syntactic enumeration.

### CS Lens

This is graceful degradation: a system continuing to provide a real, useful (if reduced) result when part of it fails, rather than failing the whole operation outright. Also recognized in: a video call dropping to audio-only when video bandwidth isn't available, a web page serving a cached version when its live data source times out, and a GPS app falling back to a previously downloaded map when it loses signal.

### SE Lens

The real alternative not chosen: `download_file` (`pdm_service.py:162-189`) could have let a GitLab failure propagate as an error, forcing every caller to handle "the file exists, but you can't have it right now." Instead, `except Exception:` (line 178) catches any real failure from `gitlab_service` and falls back to `cam_file.cam_file_content` (line 180) - the same file's content, already stored locally. The real, honest cost: catching a bare `Exception` also silently swallows a real bug inside the GitLab integration itself, not only a genuine network failure - this application currently cannot tell those two situations apart from this code alone.

### Commands needed

None.

### Verification

Not applicable under the Verification Rule's own exemption: every real claim here - the exact line numbers, the exact fallback behavior, the exact exception handling - is a direct citation to real, already-existing files, read verbatim this session.

### Connection to the previous unit

The unit above built a mechanical way to find every real route in a file; this unit used that same kind of real, verified evidence to trace one specific real route - `download_cam_file` - all the way through a real external service and its real, local fallback.

## Connect the pieces

One real route, found two ways: first mechanically, by the AST tool built in the unit above, listing `download_cam_file` among five others directly from pdm.py's real, parsed structure; then traced by hand, request to response - `GET /cam-files/<id>/download` reaches `download_cam_file` (`pdm.py:95-102`), which calls `PDMService.download_file` (`pdm_service.py:162-189`), which tries a real call to a different real server through `gitlab_service`, and falls back to this application's own locally stored copy the moment that real call fails - a real request that only makes sense once both "what routes exist" and "what happens when they run" are investigated with real evidence, not assumed from either the file's name or its docstring.

**Next lesson:** Applying everything learned so far about backend engineering concepts to the Python language itself, starting with functions as the real unit backend code is organized around.