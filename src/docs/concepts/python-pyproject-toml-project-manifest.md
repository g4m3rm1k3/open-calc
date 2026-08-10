# Concept: `pyproject.toml` — the Python Project Manifest

**What you'll understand by the end:** what a modern Python project's
manifest file controls, what its most common real sections mean, and
how a real tool actually reads it.

**Prerequisites:** `python-import-statement.md`.

## Setup

Python 3.11+ (for the standard-library `tomllib` reader used below; no
third-party package needed to *read* TOML, though writing/building a
real package needs a build backend like `setuptools`).

## The Problem

A Python project needs one canonical, standard place declaring what the
project is called, what real version it's at, which Python versions it
supports, and what other packages it depends on — a role every modern
Python project shares in common, read by installers (`pip`), build
tools, and test runners alike, instead of each tool inventing its own
separate config file.

## The Isolated Example

```python
import tomllib

manifest = """
[project]
name = "widget-tool"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "requests~=2.32",
]

[project.optional-dependencies]
dev = ["pytest~=8.0", "ruff~=0.8"]

[tool.pytest.ini_options]
pythonpath = ["."]
"""

data = tomllib.loads(manifest)
print("name:", data["project"]["name"])
print("dependencies:", data["project"]["dependencies"])
print("dev extras:", data["project"]["optional-dependencies"]["dev"])
print("pytest pythonpath:", data["tool"]["pytest"]["ini_options"]["pythonpath"])
```

**Real output, run this session:**
```
name: widget-tool
dependencies: ['requests~=2.32']
dev extras: ['pytest~=8.0', 'ruff~=0.8']
pytest pythonpath: ['.']
```

**What this proves:** `pyproject.toml` isn't a special, Python-parsed-
by-magic format — it's real, plain TOML (a general, standard config
syntax), and `tomllib.loads(...)` (Python's own standard-library TOML
reader) turns it into a completely ordinary nested `dict`/`list`
structure, addressable the same way any other Python data would be.

## Mechanical Walkthrough

- `[project]` is the standardized table (PEP 621) every real Python
  packaging tool agrees to read the same way: `name`, `version`,
  `requires-python` (the minimum/allowed interpreter versions), and
  `dependencies` (a list of real package requirements, each a string in
  pip's own requirement-specifier syntax — `"requests~=2.32"` means
  "any 2.32.x, but not 2.33+," the same `~=` compatible-release operator
  pip itself understands).
- `[project.optional-dependencies]` declares named **extra** dependency
  groups (here, `dev`) — not installed by default; a user opts in
  explicitly (e.g. `pip install .[dev]`) when they want them.
- `[tool.pytest.ini_options]` is a different kind of section: a
  **tool-specific** table, namespaced under `[tool.<name>]` specifically
  so any number of separate tools (pytest, ruff, mypy, black, ...) can
  each keep their own real configuration in this same one file without
  colliding with each other's section names or with `[project]` itself.
- Nesting in TOML (`[project.optional-dependencies]`) maps directly to
  nested dictionaries once parsed — `data["project"]["optional-
  dependencies"]` — the same real structure a JSON file with the
  equivalent nesting would produce.

## CS Lens

This is a **declarative manifest**: a single, structured, standardized
file stating *what* a project is and needs, read and acted on by
multiple independent real tools, rather than each tool requiring its
own separate configuration format or the project's own code describing
itself imperatively.

Also recognized in: `npm-package-json.md` (Node/npm's own manifest, the
identical real role in a different ecosystem — package identity,
dependencies, and tool configuration, in one canonical file) and
`Cargo.toml` (Rust), `composer.json` (PHP) — nearly every modern
language ecosystem has converged on this same real shape.

## SE Lens

The real, practical value of a single canonical manifest: any tool in
the ecosystem — an installer, a CI pipeline, an IDE — can discover a
project's real dependencies and supported Python versions without
running any of the project's own code first, just by reading one file
in a format every tool already agrees on. The real, honest tradeoff
worth naming: a project can still end up with *multiple* files
declaring overlapping information (a `requirements.txt` alongside
`pyproject.toml`'s own `dependencies`, say) if a team isn't disciplined
about it — the manifest format itself doesn't prevent that drift, it
only gives every tool one obvious, standard place to look first.

## Connection

Builds on `python-import-statement.md` (the manifest's `dependencies`
are exactly the packages later `import` statements will need installed
first). Directly parallel to `npm-package-json.md` — same real role,
different ecosystem, worth contrasting rather than treating as
unrelated.

## Try It Yourself

1. Add a second dependency to the `dependencies` list above (any real
   package name and version specifier) and confirm `tomllib.loads(...)`
   picks it up correctly in the parsed `dict`.
2. Add a second tool section, `[tool.ruff]`, with a real key like
   `line-length = 100`, and confirm it appears at `data["tool"]["ruff"]
   ["line-length"]` — a second, independent tool namespace living in the
   same file without colliding with `[tool.pytest.ini_options]`.
3. Deliberately break the TOML syntax (remove a closing `]`, say) and
   call `tomllib.loads(...)` again — read the real exception raised and
   note that it's caught before any real installation or test-running
   ever begins, not somewhere deep inside a tool's own logic.

## A Second Real Facet: `[build-system]`, `[tool.setuptools]`, and Editable Installs

Everything above is read by tools that already have the package
installed. Two more real sections declare **how the package itself
gets built and installed** in the first place — worth proving with a
real, live install, not just reading the syntax:

```toml
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "widget-tool"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = []

[project.optional-dependencies]
dev = ["pytest"]

[tool.setuptools]
packages = ["widgettool"]
```

With `widgettool/__init__.py` containing `def greeting(): return
"version one"`, running a real, editable install of this exact
manifest (`pip install -e ".[dev]"`), then importing it:

**Real output, run this session:**
```
version one
```

Editing `widgettool/__init__.py` on disk — **with no reinstall command
run at all** — and importing it again in a fresh interpreter:

**Real output, run this session:**
```
version two -- edited with no reinstall
```

**What this proves:** the second import picked up the edited source
immediately, with zero reinstall step between the two — a real,
working demonstration of what "editable" actually means: the installed
package is a live link back to this exact source directory, not a
frozen copy taken at install time.

**Mechanical detail:**

- `[build-system]` (PEP 517/518) declares **which tool actually knows
  how to build this project** — `requires` lists what needs to be
  installed to perform the build itself (here, a real, minimum
  `setuptools` version), and `build-backend` names the specific,
  callable entry point (`setuptools.build_meta`) `pip` invokes to do
  it. This is what lets `pip install` work identically regardless of
  which build tool a given project actually uses underneath.
- `[tool.setuptools] packages = ["widgettool"]` tells `setuptools`
  specifically (its own real, tool-namespaced section) which real
  importable package directories to include when building or
  installing.
- `pip install -e ".[dev]"` combines two real, independent things: `-e`
  requests an **editable install** (source stays a live link, not
  copied into the environment's site-packages), and `.[dev]` means
  "the package defined by the manifest in the current directory
  (`.`), plus its `dev` optional-dependency group" — the exact
  `[project.optional-dependencies]` table from this file's first real
  example.

### Try It Yourself (second facet)

1. Run a **non**-editable install (`pip install "."` with no `-e`)
   instead, edit the source the same way, and confirm the change is
   **not** reflected — direct, real proof of the actual difference `-e`
   makes.
2. Add a second real package directory (say, `widgettool_extra/`) and
   add it to `[tool.setuptools] packages = [...]` — confirm it becomes
   importable after reinstalling, and that omitting it from the list
   leaves it un-importable even though the folder exists on disk.
3. Look up `setuptools`'s real alternative, `[tool.setuptools.
   packages.find]` (auto-discovery, rather than an explicit list) and
   compare when each approach is more appropriate for a real, growing
   project with several source directories.
