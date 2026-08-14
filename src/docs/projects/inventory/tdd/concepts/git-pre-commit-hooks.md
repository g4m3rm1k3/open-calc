# Concept: Git Pre-Commit Hooks (the `pre-commit` Framework)

**What you'll understand by the end:** how a real pre-commit hook runs
automatically before a commit is allowed to complete, and can genuinely
**block** it on failure — as opposed to CI, which only runs *after* a
push — plus the real, practical scoping options (`files`, `types`,
`pass_filenames`) that control which changed files trigger a given
hook.

**Prerequisites:** `yaml-basic-syntax.md`.

## Setup

`pip install pre-commit`, and a real local Git repository (`git init`).

## The Problem

Catching a real, avoidable mistake (a stray debug marker, a failing
test, a linting violation) is far cheaper the moment it's about to be
committed than after it's already pushed, reviewed, and possibly
merged. A real, automatic check that runs *before* a commit can
complete — and genuinely refuses to let it through on failure — catches
these problems at the earliest, cheapest possible point.

## The Isolated Example

A real, minimal hook script:

```python
# check_no_todo.py
import sys

failed = False
for path in sys.argv[1:]:
    with open(path) as f:
        content = f.read()
    if "TODO" in content:
        print(f"{path}: contains a real TODO marker -- blocked")
        failed = True

sys.exit(1 if failed else 0)
```

A real `.pre-commit-config.yaml`, scoped to one specific file:

```yaml
repos:
  - repo: local
    hooks:
      - id: no-todo
        name: no-todo
        entry: python check_no_todo.py
        language: system
        files: ^app\.py$
        pass_filenames: true
```

After `pre-commit install` (installing this config into the repo's real
`.git/hooks/pre-commit`), staging a file that still contains `TODO` and
attempting a real commit:

**Real output, run this session:**
```
no-todo..................................................................Failed
- hook id: no-todo
- exit code: 1

app.py: contains a real TODO marker -- blocked
```

Removing the `TODO`, re-staging, and committing again:

**Real output, run this session:**
```
no-todo..................................................................Passed
[main (root-commit) 6d9d2dc] add greet function
 3 files changed, 22 insertions(+)
```

**What this proves:** the first real `git commit` attempt was
genuinely **rejected** — `git log` immediately afterward would show no
new commit at all — purely because `check_no_todo.py` exited with a
real, nonzero status. The second attempt, with the actual problem
fixed, both ran the identical hook **and** produced a real commit
(`6d9d2dc`) — the hook isn't a warning that gets logged and ignored; a
failing hook genuinely stops `git commit` from completing at all.

## Mechanical Walkthrough

- `pre-commit install` writes a real script into `.git/hooks/pre-commit`
  — Git's own, built-in hook mechanism, which Git itself calls
  automatically every time `git commit` runs, *before* the commit is
  actually created.
- The `pre-commit` framework reads `.pre-commit-config.yaml` (using
  exactly the real YAML syntax `yaml-basic-syntax.md` covers) and runs
  every configured hook in turn — if **any** hook exits with a nonzero
  status, the whole commit is aborted, with no commit object created at
  all.
- `repo: local` tells `pre-commit` to run a command **already present**
  in this project (`python check_no_todo.py`) rather than fetching a
  hook's definition from an external hook-repository — the more
  commonly documented way to use the framework, but not the only real
  one; a project can define and run its own, entirely custom checks
  this way.
- `files: ^app\.py$` is a real **regex** — the hook only runs at all
  when at least one staged, changed file matches this pattern; a
  broader real pattern like `^cnc-editor/(core|gui)/` would scope a
  hook to only two specific directories rather than the whole
  repository.
- `pass_filenames: true` means `pre-commit` appends the list of
  matching changed files as real command-line arguments to `entry`
  (`sys.argv[1:]` in the script above) — set to `false`, a hook command
  instead runs exactly once with no file arguments at all, appropriate
  for a whole-project command like a full test suite run rather than a
  per-file check.

## CS Lens

This is a real, concrete instance of a **fail-fast** gate
(`fail-fast-validation.md`'s own idea) applied to a development
*workflow*, not just to a running program's input — reject a real
problem at the earliest possible real checkpoint (before a commit even
exists) rather than downstream. It's also `git-pre-commit-hooks.md`'s
own real, distinct point in a broader continuum of "when is a check
run": locally and synchronously (a pre-commit hook, blocking the
developer immediately), versus remotely and after the fact (CI, running
on a server sometime after a push has already happened).

Also recognized in: any "gate before the action completes" mechanism —
a database's `CHECK` constraint (rejecting an invalid row before it's
ever written), a web form's client-side validation (rejecting bad input
before a network request is even sent).

## SE Lens

The real, practical value: a problem caught by a pre-commit hook costs
a developer seconds — fix it, re-stage, re-commit, still working in the
exact same context they were just in. The identical problem, caught
later by CI after a push, costs real, additional overhead — a
notification to check, a context-switch back into old work, a second
push, and (if a reviewer already looked at the PR) possibly a wasted
review pass. The real, honest tradeoff: pre-commit hooks only ever run
on a developer's **own** machine, at the moment *they* commit — they
provide zero protection against someone bypassing them locally
(`git commit --no-verify`) or against a commit made by any tool that
doesn't invoke Git's real hook mechanism at all, which is exactly why
CI (Step 16, not yet covered) still matters as a second, mandatory,
server-side layer even once pre-commit hooks exist.

## Connection

Builds on `yaml-basic-syntax.md` for the config file's own syntax.
Directly contrasted with CI (a real, separate, later concept) — local
and blocking versus remote and after-the-fact are two genuinely
different real points in the same overall "catch problems early"
spectrum, not competing or redundant approaches.

## Try It Yourself

1. Change `pass_filenames` to `false` and adjust `check_no_todo.py` to
   scan a fixed, hardcoded list of files instead of `sys.argv[1:]` —
   confirm the hook still runs, but now receives no file arguments at
   all from `pre-commit` itself.
2. Add a second real hook to the same config (say, one that rejects any
   staged file over a certain size) and confirm both hooks run on every
   real commit attempt, with a failure in *either* one blocking the
   commit.
3. Run `git commit --no-verify` against a file that still contains a
   real `TODO` and confirm the commit succeeds anyway — direct, real
   proof of the exact bypass named in this file's own SE Lens, and why
   a pre-commit hook alone is never a complete, guaranteed enforcement
   mechanism.
