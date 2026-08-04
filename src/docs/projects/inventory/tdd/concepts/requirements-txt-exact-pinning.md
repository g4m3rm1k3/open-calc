# Concept: `requirements.txt` — Exact Pinning, and the Two-File Drift Risk

**What you'll understand by the end:** `requirements.txt`'s real,
simple format — a flat list of exact version pins — how it differs
from `pyproject.toml`'s `~=` compatible-release ranges, and the real,
present risk of a project maintaining both at once with no mechanism
keeping them in sync.

**Prerequisites:** `python-dependency-version-pinning-semver.md`,
`python-pyproject-toml-project-manifest.md`.

## Setup

Python 3 with `pip install packaging` (used below to check real version
strings against both files' specifiers programmatically).

## The Problem

`pip install -r requirements.txt` is a real, long-standing way to
install a project's dependencies, predating `pyproject.toml`'s own
standardized `[project.dependencies]` table. A project using both files
at once — one declaring loose, `~=`-range dependencies for general use,
the other pinning exact versions for reproducible environments — needs
to actually keep the two in agreement; nothing about having both files
does that automatically.

## The Isolated Example

```python
from packaging.specifiers import SpecifierSet
from packaging.version import Version

# requirements.txt style: exact pin
exact = SpecifierSet("==6.10.0")

# pyproject.toml style: compatible-release range
compatible = SpecifierSet("~=6.11")

candidates = ["6.10.0", "6.11.0", "6.11.5", "6.12.0"]

for v in candidates:
    version = Version(v)
    print(f"{v:8} requirements.txt (==6.10.0) allows: {version in exact}   pyproject.toml (~=6.11) allows: {version in compatible}")

overlap = [v for v in candidates if Version(v) in exact and Version(v) in compatible]
print("versions satisfying BOTH files at once:", overlap)
```

**Real output, run this session:**
```
6.10.0   requirements.txt (==6.10.0) allows: True   pyproject.toml (~=6.11) allows: False
6.11.0   requirements.txt (==6.10.0) allows: False   pyproject.toml (~=6.11) allows: True
6.11.5   requirements.txt (==6.10.0) allows: False   pyproject.toml (~=6.11) allows: True
6.12.0   requirements.txt (==6.10.0) allows: False   pyproject.toml (~=6.11) allows: True
versions satisfying BOTH files at once: []
```

**What this proves:** a deliberately real, concrete drift scenario —
`requirements.txt` pinned to `6.10.0` and `pyproject.toml` allowing
`~=6.11` genuinely have **zero** versions in common. Installing via one
file versus the other would produce two real, incompatible
environments — someone following `requirements.txt` gets a genuinely
different real version than someone following `pyproject.toml`, with
no error or warning from either file alone; each is perfectly valid,
self-consistent, and silently wrong relative to the other.

## Mechanical Walkthrough

- `requirements.txt`'s real format is deliberately simple: one
  dependency per line, `#` for comments, and a version specifier
  directly after the package name — `PySide6==6.11.1` pins to that
  **exact** version and no other.
- `==` (exact pin) differs from `~=` (`python-dependency-version-
  pinning-semver.md`'s compatible-release operator) in a real,
  fundamental way: `==X.Y.Z` allows precisely one version; `~=X.Y`
  allows a real, bounded *range* of versions.
- Both files can coexist in the same real project for genuinely
  different purposes — `pyproject.toml`'s looser range supports library
  consumers who want compatible updates automatically; a pinned
  `requirements.txt` supports fully reproducible environments (CI,
  deployment) where every real install must produce byte-identical
  dependency versions.
- **Neither file has any real, automatic awareness of the other** — a
  developer bumping one without updating the other is a real, silent,
  unenforced action; nothing in either file's own format detects or
  prevents the two from drifting apart.

## CS Lens

This is a real, concrete instance of **duplicated source of truth** —
the identical underlying risk any system carries when the same real
fact (which dependency version to use) is declared in more than one
place with no single mechanism keeping them synchronized.
`avoid-premature-abstraction.md`'s own "rule of three" reasoning runs
the opposite direction here: this isn't premature abstraction avoided,
it's a real, present case where the *lack* of a shared source of truth
(a single lockfile both tools could read, for instance) creates a real,
ongoing maintenance burden.

Also recognized in: any project with more than one config file
declaring overlapping information (a Dockerfile's own pinned base image
version drifting from a separate CI config's pinned version); duplicated
constant definitions across two codebases meant to stay in sync (a
regex or keyword list defined once in a backend and again, separately,
in a frontend) — the same real risk category, different concrete
instance each time.

## SE Lens

The real, practical mitigation most mature projects reach for: a
dedicated **lockfile** — generated *from* the loosely-pinned manifest,
mechanically, rather than hand-maintained separately — so there's
genuinely only one real place a human edits a version constraint, with
every other pinned file derived automatically and kept honest by
tooling rather than by discipline alone. Recognizing the two-file
drift risk *without* yet having that tooling in place — the real,
current state this project's own history shows — is itself valuable:
naming a real, present gap honestly is worth more than assuming
duplication is automatically safe just because nothing has broken yet.

## Connection

Builds directly on `python-dependency-version-pinning-semver.md` (the
`~=` operator this file contrasts against) and
`python-pyproject-toml-project-manifest.md` (the other real file in
this exact drift scenario).

## Try It Yourself

1. Write a small script using `packaging` to parse a real
   `requirements.txt`-style file (one `package==version` line per
   dependency) and a real `pyproject.toml`'s `dependencies` list, then
   report any package appearing in both with genuinely incompatible
   specifiers — a real, working version of the drift-detection this
   file's own SE Lens describes as currently missing.
2. Look up `pip freeze > requirements.txt` — a real, common way
   `requirements.txt` files get generated in practice — and reason
   about whether it inherently solves or merely defers the drift risk
   named here.
3. Research a real, dedicated lockfile tool (`pip-tools`'s
   `pip-compile`, `uv`, or `poetry`) and identify specifically which
   file it treats as the single source of truth, and which file(s) it
   generates automatically from it — connecting back to this file's own
   SE Lens.
