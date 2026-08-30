# Lesson 0.3: Backend Boundaries

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Nothing new to run — this lesson names six real architectural boundaries a backend is supposed to keep separate, traces where each one lives in this exact application's own real code, then finds a real, already-documented place this backend currently violates one of them badly. The transferable problem: naming a boundary doesn't guarantee it's respected — real code has to be read to find out.

**What you need to know first:** A request/response pipeline with named stages (routing, business logic, persistence); reading a real, existing file as evidence rather than typing new code.

## Terms used in this lesson

- **Transport layer** — The part of a backend responsible only for moving raw bytes between a client and a server — sockets, HTTP parsing — with no awareness of what those bytes mean to this specific application. It exists as its own named boundary because the exact same transport code works for a manufacturing app, a blog, or anything else; nothing about it is specific to what this application does.
- **Application layer** — The part of a backend that decides which piece of code should run for a given request — routing a parsed request to a handler — without itself containing the actual business decision that handler makes. It exists as a separate boundary from domain logic (below) so the *routing* decision (which function runs) can change independently of the *business* decision (what that function actually does).
- **Domain logic** — The actual decision-making specific to this application — which parts are valid, how a filter should behave, what counts as a duplicate. It exists as its own named boundary because it's the one layer that couldn't be copied wholesale into a completely different application the way transport or application-layer code often can be.
- **Persistence** — Storing data somewhere that survives past the current request and the current process. It exists as its own boundary so domain logic can be written and tested without caring whether the data it reads or writes actually lives in a real database, a test double, or an in-memory stand-in.
- **Infrastructure** — The real, concrete technical systems domain logic depends on but isn't itself about — which specific database engine, which filesystem, which network client library. It exists as a boundary separate from persistence and external services because "we store data somewhere" (persistence, a concept) and "we use SQLite specifically, at this file path" (infrastructure, a real, swappable detail) are different kinds of claims.
- **External services** — Real, separate systems this backend depends on but doesn't control — a different real server, owned and run by someone else. It exists as its own boundary because failures here (a network timeout, a service being down) are a fundamentally different kind of problem than a bug in this application's own code.
- **Exception handling (try/except)** — A way of running code that might fail, while stating in advance what should happen if it does, using Python's real `try`/`except` statement. It exists so a real failure (a bad template, a missing row) can be handled deliberately, in one place, instead of crashing whatever else happens to be running at the time.

## Objects and methods used

- **`MachineCAMPairing.query.get`**
  - *What it is:* A real ORM query reading one row from the database by its primary key.
  - *Implementation:* `Model.query.get(primary_key) -> Model | None` - called here as `MachineCAMPairing.query.get(pairing_id)`.
  - *Its use:* Reads a real, persisted row this request needs, before anything else can happen.
  - *Type:* A class-level attribute (`query`) whose own `get` method is called on it - provided by Flask-SQLAlchemy, not written by this application.
  - *Responsibility:* Look up one real row in the real database by its primary key and return it as a real Python object, or `None` if no such row exists.
  - *Depends on:* A real, already-configured database connection.
  - *Connects to:* Its result, `pairing`, is read from repeatedly below.
  - *Shape:* Takes a plain primary-key value; returns one model instance with the row's real columns as attributes, or `None` - never a list.

- **`Jinja2 Template / .render`**
  - *What it is:* A real class from the Jinja2 templating library, and the real method that fills in a template's placeholders with real values.
  - *Implementation:* `jinja2.Template(source: str)` builds a template object from real text; `.render(**context) -> str` fills it in.
  - *Its use:* Builds an NC file's real text content from a template stored directly in the database, when one exists there.
  - *Type:* `Template` is a class; `.render` is an instance method on it.
  - *Responsibility:* Parse a real template string once, then substitute real values from the given keyword arguments wherever the template names them, producing real, final text.
  - *Depends on:* A real template string with valid Jinja2 syntax; real values for whatever names it references.
  - *Connects to:* Its input comes from `NCTemplate.query.get`, below; its output, `nc_content`, is what eventually gets saved.
  - *Shape:* `Template(...)` takes one plain string and returns one `Template` object; `.render(...)` takes arbitrary keyword arguments and returns one plain string with every placeholder substituted - text in, text out, no intermediate structure.

- **`render_template`**
  - *What it is:* Flask's own real function for rendering a template stored as a real file on disk, instead of a string already in memory.
  - *Implementation:* `flask.render_template(template_name: str, **context) -> str`
  - *Its use:* The real fallback when no matching template row exists in the database - reads a real `.jinja2` file from this application's own templates folder instead.
  - *Type:* A free function.
  - *Responsibility:* Locate a real template file by name, parse it, and substitute the given values into it - the same substitution job as `Template.render`, above, sourced from a real file instead of a database row.
  - *Depends on:* A real template file actually existing at the given path.
  - *Connects to:* Called only when `NCTemplate.query.get`, below, returned nothing.
  - *Shape:* Takes a plain filename string plus arbitrary keyword arguments; returns one plain string - the same input/output shape as `Template.render`, above, just sourced from a file instead of an in-memory string.

- **`NCTemplate.query.get`**
  - *What it is:* The same real kind of ORM lookup as `MachineCAMPairing.query.get`, above, applied to a different real table.
  - *Implementation:* `NCTemplate.query.get(template_id) -> NCTemplate | None`
  - *Its use:* Checks whether a real template is stored in the database before falling back to a real file on disk.
  - *Type:* A class-level attribute (`query`) whose own `get` method is called on it.
  - *Responsibility:* Look up one real row by primary key, returning `None` if no matching template is stored in the database.
  - *Depends on:* A real, already-configured database connection.
  - *Connects to:* Its result, `db_tpl`, decides which of the two real rendering paths above actually runs.
  - *Shape:* Takes a plain primary-key value; returns one model instance or `None` - the same shape as `MachineCAMPairing.query.get`, above, on a different table.

- **`_build_export_data`**
  - *What it is:* One of four real, substantial functions this lesson's own investigation already found living directly in this routes file, instead of in the service file that exists for exactly this kind of logic.
  - *Implementation:* `_build_export_data(pairing, cam_file, machine, part, sequences, operation_order)`, defined at `backend/app/routes/operation_manager.py:815-904` - a real, 90-line function, confirmed this session.
  - *Its use:* Called from inside the route to build the real data structure the template above is rendered against.
  - *Type:* A free function, at module level, in a real routes file.
  - *Responsibility:* Transform the real, separate pieces of data this route already looked up (a pairing, a CAM file, a machine, a part, sequences, an operation order) into the one combined structure the template rendering above actually needs.
  - *Depends on:* Real objects already fetched via `MachineCAMPairing.query.get` and similar real lookups this route performs first.
  - *Connects to:* Called once, from inside `generate_nc_file`; its return value, `context`, is passed straight into the real template rendering above.
  - *Shape:* Takes six separate real objects as plain arguments; returns one dict - a real return type confirmed this session by reading the function's own docstring and body. That dict's keys are exactly the placeholder names the template rendering above substitutes against.

## Concept Unit: Naming the Real Boundaries

### The Problem

The pipeline traced through GET /api/parts already showed several real stages doing genuinely different kinds of work. "Different kinds of work" is a real architectural claim, not just a description — it means each of those stages is supposed to be replaceable or testable on its own, without dragging every other stage along with it.

Before reading on:

- Given the six terms just defined, which of them could you replace (a different database engine, a different web framework) without touching this application's own domain logic at all, if the boundaries were actually kept clean?
- Which of the six would you expect to be the hardest to test in isolation, and why?

### Project Change

- **Reference Source:** backend/app/routes/parts.py:18-55 (already read and quoted in this curriculum's own tracing of the request/response pipeline); backend/run.py:1-19; backend/app/models/part.py.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A
- **Dependencies:** None beyond the real repository already checked out on disk.

### CS Lens

This is layered architecture: a system organized so each layer only depends on the layer(s) beneath it, never the reverse, and each layer can be understood, tested, or replaced without full knowledge of the others. Also recognized in: the OSI networking model (physical, data link, network, transport, ... application — the same idea this lesson's own "transport" and "application" terms are directly named after), a car's own separation between its engine, transmission, and body (each replaceable by a mechanic without redesigning the others), and a restaurant's separation between the kitchen (domain logic), the walk-in cooler (persistence), and its produce supplier (an external service it depends on but doesn't control).

### SE Lens

The real alternative this application could have taken and didn't: writing every request handler as one undifferentiated block of code, transport parsing through database writes all inline. That alternative is genuinely faster to write once and genuinely more expensive later — every one of these six boundaries, kept separate, is what lets one of them change (a different database, a stricter validation rule) without a developer needing to re-verify all the others still work. The next unit shows this application's own real, current cost of not keeping one of these boundaries clean.

### Verification

Not applicable under the Verification Rule's own exemption: every claim in this unit is a direct citation to real, already-existing files, already read and quoted elsewhere in this curriculum — there is no execution to run.

### Connection to the previous unit

There is no previous unit — this is the first one in this lesson.

## Concept Unit: Where This Backend Actually Violates Them

### The Problem

Naming six clean boundaries doesn't mean this real application actually respects all of them. Before reading on, given that domain logic (Terms, above) is supposed to be independent of the application layer that calls it — what would it look like, in real code, if that boundary were violated? What would you expect to find living somewhere it shouldn't?

Before reading on:

- If a route file contained real business logic instead of just calling out to it, what would that route function's own line count start to look like compared to the other routes in the same file?

### Project Change

- **Reference Source:** backend/app/routes/operation_manager.py:465-503, 544-563, and 815-829 - three real, verbatim excerpts from a single, much larger real file (the route itself is 160 real lines, 465-624; the full file is over 900 lines) - not the whole function, but enough of it, contiguous and unedited, to show the real mixing this unit's own Lenses describe, rather than only asserting it.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A
- **Dependencies:** None beyond the real repository already checked out on disk.

`generate_nc_file` is the real route this application uses to turn reconciled operation data into a real NC file, using a real Jinja2 template. The three excerpts below show its real opening (routing, a database lookup, real debug logging), its real template-rendering section (two different real paths to the same outcome, one from the database, one from a file on disk), and the real signature of one of four functions this curriculum's own investigation already found living in this same routes file instead of in the service file that exists for exactly this kind of logic.

### The Updated Project

**File:** `backend/app/routes/operation_manager.py (lines 465-503)` (already exists — read-only, nothing to type)

```python
@operation_manager_bp.route('/operation-orders/<pairing_id>/generate', methods=['POST'])
def generate_nc_file(pairing_id):
    """
    GENERATE NC FILE FROM TEMPLATE

    Generates an NC file using a Jinja2 template and the reconciled
    operation data. Saves the file to the database as an NCFile record.

    URL Parameters:
        pairing_id: The MachineCAMPairing ID
    """
    try:
        from jinja2 import Template

        # STEP 0: Get template ID and filename from request
        data = request.get_json() or {}
        template_id = data.get('templateId', 'default_nc')
        custom_file_name = data.get('fileName')

        # STEP 1: Validate pairing exists
        pairing = MachineCAMPairing.query.get(pairing_id)
        if not pairing:
            return jsonify({'error': 'Machine pairing not found'}), 404

        # DEBUG
        print(f"[NC-GEN] Pairing ID: {pairing_id}")
        print(f"[NC-GEN] CAM File ID on Pairing: {pairing.cam_file_id}")

        # STEP 2: Get related entities
        cam_file = CAMFile.query.get(pairing.cam_file_id)
        machine = Machine.query.get(pairing.machine_id) if pairing.machine_id else None
        part = Part.query.get(cam_file.part_id) if cam_file else None
```

**File:** `backend/app/routes/operation_manager.py (lines 544-563)` (already exists — read-only, nothing to type)

```python
# STEP 6: Load and Render template
nc_content = ""
db_tpl = NCTemplate.query.get(template_id)

if db_tpl:
    print(f"[NC-GEN] DB Template Found. Content length: {len(db_tpl.content)}")
    # Render from database content
    try:
        tpl = Template(db_tpl.content)
        nc_content = tpl.render(**context)

    except Exception as e:
        return jsonify({'error': f"Template rendering error: {str(e)}"}), 500
else:
    # Fallback to filesystem
    template_path = f'nc_files/{template_id}.jinja2'
    try:
        nc_content = render_template(template_path, **context)
    except Exception as template_err:
        return jsonify({'error': f"Template error: {str(template_err)}"}), 500
```

**File:** `backend/app/routes/operation_manager.py (lines 815-829)` (already exists — read-only, nothing to type)

```python
def _build_export_data(pairing, cam_file, machine, part, sequences, operation_order):
    """
    Build the complete export data structure.

    This is a PURE FUNCTION (no side effects) that transforms input data.
    Following Single Responsibility Principle - only builds export structure.

    Args:
        pairing: MachineCAMPairing object
        cam_file: CAMFile object
        machine: Machine object (or None)
        part: Part object (or None)
        sequences: List of Sequence objects
        operation_order: OperationOrder object (or None)
```

### Mechanical Walkthrough

- `@operation_manager_bp.route('/operation-orders/<pairing_id>/generate', methods=['POST'])` — `Blueprint.route` registers `generate_nc_file` against this path and method list, so Flask calls it whenever a matching request arrives - this route only accepts `POST`, since generating a file is a real action, not a read.
- `try: from jinja2 import Template ...` — Exception handling wraps nearly the entire route - a single `try` covering everything from the request parsing through the final database write (not shown in this excerpt), so any real failure anywhere in that whole sequence is caught in one place, at the very end of the real function (not shown in this excerpt either).
- `data = request.get_json() or {}` — Reads the real request's JSON body, falling back to an empty `dict` if none was sent - `or` (basic Python).
- `pairing = MachineCAMPairing.query.get(pairing_id); if not pairing: return jsonify(...), 404` — `MachineCAMPairing.query.get` reads the real, persisted row this whole request is about; a real `404` is returned immediately if it doesn't exist, before any of the real work below ever runs.
- `print(f"[NC-GEN] Pairing ID: {pairing_id}")` — Real, plain `print` statements, prefixed `[NC-GEN]` by convention - this application's real debug logging, run directly in production route code rather than through a real logging framework.
- `cam_file = CAMFile.query.get(...); machine = Machine.query.get(...) if ... else None; part = Part.query.get(...) if ... else None` — The same real `Model.query.get` pattern as `MachineCAMPairing.query.get`, above, repeated for three more real tables - each a separate real database round-trip, one after another, inside the same route function.
- `db_tpl = NCTemplate.query.get(template_id)` — `NCTemplate.query.get` checks whether a real template row exists in the database for the given id - `db_tpl` is either a real row or `None`, and that single value decides which of the two real rendering paths below actually runs.
- `if db_tpl: ... tpl = Template(db_tpl.content); nc_content = tpl.render(**context) ... except Exception as e: return jsonify(...), 500` — When a real template row exists, `Jinja2 Template`/`.render` builds the real output text from it, wrapped in its own exception handling - a real rendering failure here returns a real `500` with the real error message included.
- `else: ... nc_content = render_template(template_path, **context) except Exception as template_err: return jsonify(...), 500` — When no database row exists, `render_template` reads a real `.jinja2` file from disk instead - a second, separate real path to the same real outcome, with its own separate exception handling around it.
- `def _build_export_data(pairing, cam_file, machine, part, sequences, operation_order):` — `_build_export_data`'s real signature - six real parameters, matching exactly the real objects the excerpt above already fetched (`pairing`, `cam_file`, `machine`, `part`) plus two more (`sequences`, `operation_order`) - this is the real function this route calls, further down in the same file, to combine everything just looked up into the one structure the template rendering above actually needs.

### CS Lens

This is a real instance of the "God object"/"God function" anti-pattern applied to a route handler instead of a class — one function or module accumulating responsibilities that belong to several different, genuinely separate layers. Also recognized in: a single utility class in a large codebase that ends up importing from every other module because everyone added "just one more helper" to it, and a single spreadsheet tab that starts as one report and slowly absorbs raw data entry, formulas, and a dashboard all in the same sheet.

### SE Lens

The real, current, honest cost, not a hypothetical one, directly visible in the excerpts just shown: real database lookups (four separate `.query.get` calls, back to back), real print-based debug logging, and real Jinja2 template loading and rendering - with two entirely separate fallback paths - all inline, all in one function, all before the function has even finished (the excerpts above stop before the real database write that follows). `_build_export_data`, called from inside this same route, is one of four real functions - together 248 real lines, about 23% of `operation_manager.py`'s entire file - constituting a full, real domain service that lives directly in the routes module instead of in `operation_manager_service.py`, the file that exists specifically to hold this kind of logic. The alternative not chosen: moving this logic into the service file that already exists for it. The real cost of not having done so, now visible directly in real code rather than only asserted: none of this logic can be tested, reused, or reasoned about without also reading and understanding an HTTP route handler at the same time - the domain layer and the application layer have been fused into one file, and untangling them later has to happen with real, currently-passing behavior still intact.

### Verification

Not applicable under the Verification Rule's own exemption: every real claim here is directly backed by the real code quoted above, read and confirmed verbatim from the genuine current source this session - there is no execution to run; the code itself is the evidence.

### Connection to the previous unit

The unit above named six boundaries a backend is supposed to keep separate; this unit found one real, already-documented place in this exact application where two of them — the application layer and domain logic — are not separate at all.

## Connect the pieces

Six named boundaries, traced through one real request in the unit above (transport and application layer real and working, domain logic and persistence real and working, for GET /api/parts) — then one real, concrete counter-example: operation_manager.py, where 248 lines of real domain logic and a 160-line route handler mixing transport, domain logic, templating, and persistence together prove that naming a boundary and actually keeping it are two different things, in this exact, real codebase.

**Next lesson:** How to actually investigate a real, unfamiliar backend before trusting any of it — entry points, imports, routes, models, services, configuration, dependencies.