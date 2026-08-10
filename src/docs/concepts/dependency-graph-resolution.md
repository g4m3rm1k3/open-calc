# Concept: Dependency Graph Resolution & Pinning

**What you'll understand by the end:** how a package manager satisfies a whole tree of version constraints from one install command, and why recording exact versions afterward matters.

**Prerequisites:** `python-namespace-isolation-venv.md` (recommended, not required — pinning matters with or without a virtual environment, but the two are normally used together).

## Setup

Python 3 with `pip` available (ships with Python). No internet-independent alternative — this example genuinely downloads a real package to observe real resolution behavior.

## The Problem

A requested package often depends on other packages, each with its own version constraints on what *it* needs. A package manager must find one consistent set of versions satisfying every constraint at once — this is **transitive dependency resolution**. And whoever runs the project later, including the same person on a different machine, needs the *exact same* versions, not "whatever's newest that day."

## The Isolated Example

```
pip install flask
```

**Real output (abridged):**
```
Collecting flask
Collecting blinker>=1.9.0 (from flask)
Collecting click>=8.1.3 (from flask)
Collecting itsdangerous>=2.2.0 (from flask)
Collecting jinja2>=3.1.2 (from flask)
Collecting markupsafe>=2.1.1 (from flask)
Collecting werkzeug>=3.1.0 (from flask)
Successfully installed blinker-1.9.0 click-8.4.2 flask-3.1.3
itsdangerous-2.2.0 jinja2-3.1.6 markupsafe-3.0.3 werkzeug-3.1.8
```

**What this proves:** one requested package pulled in five more, each with its own minimum-version constraint (`>=1.9.0` etc.), and `pip` found one exact set of versions satisfying all of them simultaneously, without ever being told any of those five names directly.

Then, pinning what was actually installed:
```
pip freeze > requirements.txt
```
```
blinker==1.9.0
click==8.4.2
Flask==3.1.3
itsdangerous==2.2.0
jinja2==3.1.6
markupsafe==3.0.3
werkzeug==3.1.8
```

## Mechanical Walkthrough

- `pip install flask` reads Flask's own declared dependencies (published alongside the package), recursively does the same for each of *those*, and computes one version per package satisfying every constraint discovered along the way.
- `pip freeze` inspects the environment's installed packages and prints each one with the *exact* version found — `==`, not a range.
- `>` is shell redirection: instead of printing to the screen, it writes that output into a file, creating it if missing or overwriting it if present.

## CS Lens

This is **dependency graph resolution** — treating packages and their version constraints as nodes and edges in a graph, and searching for an assignment of one version per node satisfying every edge's constraint (or reporting failure if none exists — real, and a common real-world occurrence called "dependency hell" when two packages need incompatible versions of a third).

Also recognized in: `npm`/`package-lock.json`, Java's Maven/Gradle, Rust's Cargo, and Linux distributions' own package managers (`apt`, `dnf`) — every ecosystem with a package manager solves this exact graph-satisfaction problem.

## SE Lens

The alternative — telling a collaborator "just `pip install flask`" with no pinned file — risks them getting a newer, subtly incompatible version months later: a real, silent version-drift bug with no error message pointing at the cause. Pinning trades a small amount of staleness (you won't automatically get security patches) for total reproducibility. The real, ongoing cost: nothing regenerates a pinned file automatically — an intentional upgrade means running `pip freeze` again by hand and reviewing what changed.

## Connection

Builds on `python-namespace-isolation-venv.md` — pinning is most meaningful when it's pinning *one project's own* environment, not a shared global one where "the installed version" could mean something different for every project on the machine.

## Try It Yourself

1. Install a package, then install an *older* version of it explicitly (`pip install somepackage==<older-version>`). Run `pip freeze` before and after — confirm the pinned version actually changed.
2. Delete `requirements.txt`, then recreate it from a fresh virtual environment using `pip install -r` against a copy you saved first. Confirm the reinstalled versions match exactly.
3. Manually edit a pinned file to raise one version's minimum bound above what's actually available, then try `pip install -r requirements.txt`. Read the real resolution-failure error pip produces.
