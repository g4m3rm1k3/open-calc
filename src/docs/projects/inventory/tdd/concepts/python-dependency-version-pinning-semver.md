# Concept: Dependency Version Pinning (PEP 440's `~=` Operator)

**What you'll understand by the end:** why leaving a dependency's
version unconstrained is a real, concrete reproducibility risk, and how
PEP 440's `~=` "compatible release" operator constrains a dependency to
a real, bounded range instead of pinning it to one exact version.

**Prerequisites:** `dependency-graph-resolution.md`.

## Setup

Python 3 with `pip install packaging` (used below to check real version
strings against real specifiers programmatically, without needing to
actually install multiple package versions).

## The Problem

A project's dependencies section can list a package with **no** version
constraint at all (`"requests"`) or with **some** constraint
(`"requests>=2.0"`, `"requests~=2.31"`). An unconstrained dependency
means a fresh install, run weeks or months after the original one, can
silently pull down a genuinely different, newer version than whatever
was originally tested against — the exact opposite of a reproducible
build, where the same manifest should produce the same real, working
result every time.

## The Isolated Example

```python
from packaging.specifiers import SpecifierSet
from packaging.version import Version

# Unpinned -- ANY version satisfies this (an empty specifier set).
unpinned = SpecifierSet("")

# Pinned with PEP 440's "compatible release" operator.
pinned = SpecifierSet("~=6.11")

candidates = ["6.10.0", "6.11.0", "6.11.5", "6.12.0", "7.0.0"]

for v in candidates:
    version = Version(v)
    print(f"{v:8} unpinned allows it: {version in unpinned}   ~=6.11 allows it: {version in pinned}")
```

**Real output, run this session:**
```
6.10.0   unpinned allows it: True   ~=6.11 allows it: False
6.11.0   unpinned allows it: True   ~=6.11 allows it: True
6.11.5   unpinned allows it: True   ~=6.11 allows it: True
6.12.0   unpinned allows it: True   ~=6.11 allows it: True
7.0.0    unpinned allows it: True   ~=6.11 allows it: False
```

**What this proves:** the unpinned specifier accepted **every** real
candidate version, including a much older one (`6.10.0`) and a much
newer, potentially-breaking major release (`7.0.0`) — genuinely no
constraint at all. `~=6.11` drew a real, concrete boundary: it accepted
`6.11.0` through `6.12.0` (any real patch or minor release that keeps
the same `6.x` major version, at or above `6.11`) but correctly
**rejected** both `6.10.0` (older than the stated minimum) and `7.0.0`
(a new major version, which PEP 440 treats as a real, potential
breaking-change boundary).

## Mechanical Walkthrough

- `SpecifierSet("")` — an empty string — is a real, valid specifier
  that constrains nothing; every real version satisfies it.
- `SpecifierSet("~=6.11")` uses PEP 440's **compatible release**
  operator: `~=X.Y` means "at least `X.Y`, but less than the next major
  version above `X`" — concretely, `~=6.11` expands to "`>=6.11,
  <7.0"`. Adding a third version component narrows it further:
  `~=6.11.2` would mean "`>=6.11.2, <6.12`" instead.
- `version in specifier_set` is real, working membership syntax the
  `packaging` library provides — it parses both the version string and
  the specifier string according to the real PEP 440 grammar and
  reports whether the version genuinely satisfies every constraint in
  the set.
- A real `pyproject.toml`'s `dependencies` list uses this identical
  specifier syntax directly as a string next to each package name
  (`"somepackage~=6.11"`) — a real package manager (`pip`, `uv`, ...)
  parses and enforces it the same way this isolated example does
  programmatically.

## CS Lens

This is **semantic versioning** (semver) put into practice: a version
number's own structure (`major.minor.patch`) is treated as carrying
real meaning — a major-version bump signals "may contain breaking
changes," while a minor or patch bump is expected to stay backward
compatible. PEP 440's `~=` operator is a real, direct encoding of "trust
minor/patch updates automatically, but require a deliberate,
human-reviewed decision before ever crossing a major version boundary."

Also recognized in: npm's own `^`/`~` version-range prefixes in
`package.json` (`npm-package-json.md`'s own real manifest format,
solving the identical real problem with different symbols), and any
package ecosystem's "lockfile" mechanism (`dependency-graph-
resolution.md`'s own pinning discussion) — both real, independent
solutions to the same underlying reproducibility need.

## SE Lens

The real, practical tradeoff: pinning to one single, exact version
(`"somepackage==6.11.3"`) maximizes reproducibility but means real
security or bug-fix patch releases never get picked up without a
manual, deliberate bump; leaving a dependency fully unconstrained
maximizes convenience but risks an unreviewed, potentially-breaking
change landing silently on the next fresh install. `~=` is a real,
deliberate middle ground — automatic patch/minor updates (usually safe,
often containing real fixes) while still requiring a conscious decision
before crossing into a new major version (where real breaking changes
are actually expected to live, per semver's own convention).

## Connection

Builds on `dependency-graph-resolution.md`'s own pinning discussion —
this file gives PEP 440's specific, real syntax its own full treatment.
Directly relevant to any `pyproject.toml` (`python-pyproject-toml-
project-manifest.md`) that lists real dependencies.

## Try It Yourself

1. Add a fourth-component candidate version (`"6.11.5.post1"`, a real,
   valid PEP 440 "post-release" suffix) and check it against both
   specifiers — research what a post-release actually signifies before
   assuming it behaves like an ordinary patch bump.
2. Write a specifier using `>=` and `<` directly (`">=6.11,<7.0"`) and
   confirm it produces the identical real membership results as
   `~=6.11` across all five candidate versions — `~=` is real,
   convenient shorthand for a range that could always be spelled out
   explicitly.
3. Look up what happens, concretely, when two dependencies in the same
   real project specify incompatible version ranges for a shared
   transitive dependency — connect this back to
   `dependency-graph-resolution.md`'s own resolution process.
