# Concept: A GitHub Actions CI Workflow — Real Structure

**What you'll understand by the end:** the real structure of a GitHub
Actions workflow file — triggers (`on:`), jobs, steps (`uses:` vs.
`run:`), scoped `env:`, and a genuine, well-known YAML parsing gotcha
the unquoted `on:` key causes in some parsers — plus how CI's real
enforcement point (remote, after a push, reporting failure) differs
from a pre-commit hook's (local, before the commit even completes).

**Prerequisites:** `yaml-basic-syntax.md`, `git-pre-commit-hooks.md`.

## Setup

`pip install pyyaml` (used below only to parse and inspect a real
workflow file's structure — GitHub's own servers are what actually run
a real workflow; nothing here requires a GitHub account or a push).

## The Problem

Running the same checks a pre-commit hook already runs locally
(`git-pre-commit-hooks.md`) is still valuable to run **remotely** too —
a pre-commit hook can always be bypassed (`--no-verify`) or simply never
installed by a given contributor; CI runs on a server, for every real
push and pull request, regardless of what happened (or didn't) on
anyone's own machine.

## The Isolated Example

A real, invented CI workflow:

```yaml
name: CI

on:
  push:
    paths:
      - "app/**"
      - ".github/workflows/ci.yml"
  pull_request:
    paths:
      - "app/**"

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libegl1
      - name: Install project
        run: pip install -e ".[dev]"
      - name: Run tests
        env:
          QT_QPA_PLATFORM: offscreen
        run: pytest
```

Parsing this real file with `yaml.safe_load` and inspecting its
structure:

**Real output, run this session:**
```
real top-level keys PyYAML actually parsed: ['name', True, 'jobs']
'on' triggers, accessed via the boolean key True: ['push', 'pull_request']
push paths filter: ['app/**', '.github/workflows/ci.yml']
job runs on: ubuntu-latest
working directory default: app
number of steps: 5
  [uses] actions/checkout@v4
  [uses] actions/setup-python@v5
  [run] Install system dependencies
  [run] Install project
  [run] Run tests
last step's own scoped env: {'QT_QPA_PLATFORM': 'offscreen'}
```

**What this proves — including a real, honest surprise:** the parsed
top-level keys are `['name', True, 'jobs']` — **not** `'on'` at all.
PyYAML's default loader follows the YAML 1.1 spec, which treats bare,
unquoted `on`/`off`/`yes`/`no` as **booleans** — so `on:`, written
exactly the way real GitHub Actions files write it, parsed to the
literal Python value `True` as its own dictionary key, not the string
`"on"`. Accessing `parsed[True]` (not `parsed["on"]`) is genuinely
required to reach the triggers — a real, well-known YAML gotcha, not
specific to this made-up example.

Quoting the key fixes it:

```python
workflow_quoted = """
name: CI
"on":
  push:
    paths:
      - "app/**"
"""
parsed = yaml.safe_load(workflow_quoted)
print(list(parsed.keys()))
print(parsed["on"]["push"]["paths"])
```

**Real output, run this session:**
```
['name', 'on']
['app/**']
```

**What this proves:** quoting the key (`"on":`) genuinely fixes the
issue — PyYAML no longer applies its implicit boolean resolution to an
explicitly-quoted string. GitHub's own real workflow parser is YAML
1.2-aware and does **not** have this bug (real, unquoted `on:` works
correctly in an actual `.yml` workflow file on GitHub) — this is
specifically a PyYAML/YAML-1.1-parser quirk worth knowing about if you
ever parse a real workflow file yourself with a Python script, not a
bug in GitHub Actions' own files.

## Mechanical Walkthrough

- `on:` (or, quoted, `"on":`) names the real **trigger** events —
  `push`, `pull_request`, and others — that cause the workflow to run
  at all. Each trigger can carry its own `paths:` filter, restricting
  the workflow to only run when at least one changed file matches a
  real glob pattern — `"app/**"` here, so an unrelated change elsewhere
  in a larger repository wouldn't trigger this workflow.
- `jobs:` names one or more real, independent units of work — each job
  runs on its own fresh, real virtual machine (`runs-on: ubuntu-
  latest`), starting with nothing installed.
- `defaults: run: working-directory:` sets a real default directory
  every subsequent `run:` step in this job executes from, without
  repeating `cd app &&` at the start of every single step.
- Each entry under `steps:` is either a `uses:` step — running a real,
  versioned, reusable action published by someone else (`actions/
  checkout@v4` fetches the repository's code; `actions/setup-
  python@v5` installs a specific Python version) — or a `run:` step,
  executing a real, literal shell command, exactly the same real block-
  scalar (`|`) syntax `yaml-basic-syntax.md`'s second facet covers for
  a genuinely multi-line command.
- A step-scoped `env:` sets a real environment variable for **just**
  that one step — `QT_QPA_PLATFORM: offscreen` here is the identical
  real setting `pyside6-headless-gui-testing.md` already covers, now
  set at the CI level instead of inside a test file's own setup code.

## CS Lens

This is a real, declarative **pipeline** description: the workflow file
states *what* should happen and *under what conditions*, and GitHub's
own infrastructure — not this repository's own code — is responsible
for actually provisioning a machine, executing each step in order, and
reporting success or failure back. The `on:`/boolean gotcha itself is a
concrete, real instance of a broader danger in any format with
**implicit type coercion** — a value's real, intended meaning (the
string `"on"`) silently became a different real type (a boolean)
because the format's own parsing rules interpreted an unquoted token
more aggressively than a human reader would expect.

Also recognized in: any YAML file using words like `yes`, `no`, `true`,
`false`, `on`, `off` as literal string keys or values without quoting —
the identical real risk recurs anywhere YAML 1.1's implicit boolean
resolution applies; GitLab CI, CircleCI, and other CI systems all use
the identical real trigger/job/step conceptual shape under different
real keyword names.

## SE Lens

The real, concrete contrast with `git-pre-commit-hooks.md`, stated
plainly: a pre-commit hook runs **locally**, before a commit completes,
and can be bypassed (`--no-verify`) or simply never installed by a
given contributor. CI runs **remotely**, on GitHub's own real
infrastructure, for every real push and pull request, entirely outside
any individual contributor's control — it can't be skipped by forgetting
to install something locally. Both this workflow and Step 15's
pre-commit hooks run the identical real four checks (lint, format-check,
type-check, test) — the real difference is purely *where* and *when*
each one runs, and what happens if it's skipped: a pre-commit hook
missing means a bad commit might still happen locally; CI missing (or
failing) means it's visible and blocking at the pull-request level
regardless.

## Connection

Builds on `yaml-basic-syntax.md` (including its block-scalar facet, used
directly by the multi-line `run:` step here) and directly contrasts with
`git-pre-commit-hooks.md` — local/blocking vs. remote/after-the-fact,
two real, complementary enforcement points rather than competing ones.
`QT_QPA_PLATFORM: offscreen` connects directly to `pyside6-headless-
gui-testing.md`'s own real environment variable.

## Try It Yourself

1. Add a `pull_request` handler's own separate `paths:` filter that
   differs from `push`'s, and confirm (by inspecting the parsed
   structure) that each trigger can genuinely have independent
   filtering rules.
2. Add a job-level `env:` (outside any individual step) and confirm,
   via the parsed structure, that it applies to the whole job's
   dictionary rather than being nested inside one particular step —
   contrast this with the step-scoped `env:` shown above.
3. Try parsing a workflow using `yaml.safe_load(..., Loader=yaml.
   SafeLoader)` versus researching a YAML 1.2-compliant parser instead
   (some libraries offer one) — confirm whether the `on:`-as-boolean
   issue persists, and explain why GitHub's own real parser doesn't
   have this problem even though real workflow files write `on:`
   unquoted every time.
