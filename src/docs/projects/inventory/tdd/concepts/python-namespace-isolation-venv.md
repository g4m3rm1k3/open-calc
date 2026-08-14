# Concept: Namespace Isolation via Virtual Environments

**What you'll understand by the end:** why Python projects use a private, per-project copy of the interpreter and its packages instead of one shared, machine-wide install.

**Prerequisites:** none.

## Setup

Python 3 installed and available on your PATH. Nothing else — `venv` is part of the standard library.

## The Problem

Python packages get installed somewhere on your machine. If every package is installed globally, every Python project on that machine shares the same set of package versions. One project might need an older library version; another might need a newer one with a feature the old version doesn't have. Installing one can break the other. This isn't hypothetical — it's one of the most common reasons a project that "worked yesterday" stops working today.

## The Isolated Example

```
python -m venv .venv
```

Then, confirm the private interpreter exists (macOS/Linux):
```
ls .venv/bin/python
```
(Windows PowerShell: `Test-Path ".venv\Scripts\python.exe"`)

**Real output:**
```
.venv/bin/python
```

**What this proves:** `python -m venv .venv` printed nothing (silence means success for most CLI tools), but it created a real, separate folder containing its own `python` executable — proven by finding it on disk. That interpreter is a distinct file from the system's own, with its own private package storage sitting next to it.

Install something into it specifically, and prove it's isolated:
```
.venv/bin/python -m pip install requests
.venv/bin/python -c "import requests; print(requests.__file__)"
python -c "import requests" 2>&1 | tail -1
```

**Real output:**
```
/path/to/project/.venv/lib/python3.x/site-packages/requests/__init__.py
ModuleNotFoundError: No module named 'requests'
```

**What this proves:** `requests` exists for the venv's own interpreter, and does not exist for the system `python` — genuinely separate, non-overlapping package storage.

## Mechanical Walkthrough

- `-m venv` runs Python's built-in `venv` module as a program (rather than importing it) — a standard-library module whose entire job is creating these isolated folders.
- `.venv` is just the folder name chosen; the leading dot is a Unix-like convention for "hidden, not usually shown by default," honored loosely on Windows too.
- Running packages *through that specific interpreter* (`.venv/bin/python -m pip install ...`) installs into that interpreter's own `site-packages`, not the system one — the isolation comes from which `python` binary you invoke, not from any special flag on `pip` itself.

## CS Lens

This is **namespace isolation** — giving two things the same name (a package, at some version) separate, non-interfering storage, resolved by context (which environment is active, i.e. which `python` binary you ran) rather than by forcing globally unique names.

Also recognized in: Docker containers (isolating whole OS dependencies, not just Python packages), Node.js's per-project `node_modules/`, Java's classpath scoping, and DNS split-horizon resolution (the same hostname resolving differently depending on which network asks).

## SE Lens

The alternative — installing everything globally, once — is simpler for a single, permanent project, and stops being simpler the instant two projects need conflicting versions of the same package. Isolating per-project trades a small amount of setup ceremony (creating and remembering to use the right environment) for eliminating an entire class of "worked yesterday, broken today" bug caused by one project's upgrade silently affecting another.

## Connection

Pairs directly with `dependency-graph-resolution.md` — a virtual environment is *where* pinned dependencies actually get installed; the isolation only matters because different projects can pin different, conflicting versions.

## Try It Yourself

1. Create two virtual environments in two different folders, and `pip install` two different versions of the same package (e.g. explicitly `pip install requests==2.28.0` in one, `pip install requests==2.31.0` in the other). Confirm each has the version you asked for with `pip show requests`.
2. Delete the `.venv` folder entirely, then try running a script that imports something you installed into it. What error do you get, and why does deleting a folder break a program?
3. Without activating anything, call two different virtual environments' interpreters by their full paths in the same terminal session, one after another. Confirm each one only sees its own installed packages.
