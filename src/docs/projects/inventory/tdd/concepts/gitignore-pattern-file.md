# Concept: `.gitignore` — Preventing Tracking, Not Untracking

**What you'll understand by the end:** `.gitignore`'s real glob-pattern
mechanism for telling Git to never track matching files, and the real,
easy-to-miss distinction it doesn't cover: an ignore rule alone does
**not** retroactively untrack a file that's already committed — that
needs a separate, explicit removal step.

**Prerequisites:** none beyond the assumed floor.

## Setup

A real, local Git repository (`git init`).

## The Problem

Some real files genuinely shouldn't be tracked by version control at
all — generated build artifacts, logs, editor-specific metadata — files
that get regenerated automatically and would just create real,
meaningless diff noise (or worse, real merge conflicts) if committed.
`.gitignore` tells Git to never offer these for tracking in the first
place — but a real, easy mistake is assuming it also cleans up a file
that got committed *before* the ignore rule existed.

## The Isolated Example

A real, deliberate mistake, and its real fix:

```bash
# A build artifact gets accidentally committed.
echo "build artifact" > build_output.log
git add build_output.log
git commit -m "accidentally commit a build artifact"
git ls-files
```

**Real output, run this session:**
```
build_output.log
```

Adding a `.gitignore` rule **after the fact**:

```bash
echo "*.log" > .gitignore
git add .gitignore
git commit -m "add gitignore rule"
git ls-files
```

**Real output, run this session:**
```
.gitignore
build_output.log
```

Trying to add a **new** `.log` file:

```bash
echo "new log" > second.log
git add second.log
```

**Real output, run this session:**
```
The following paths are ignored by one of your .gitignore files:
second.log
hint: Use -f if you really want to add them.
```

The real, required fix for the already-committed file:

```bash
git rm --cached build_output.log
git commit -m "untrack the accidentally-committed build artifact"
git ls-files
```

**Real output, run this session:**
```
.gitignore
```

And confirming the real file itself is untouched on disk:

```bash
cat build_output.log
```

**Real output, run this session:**
```
build artifact
```

**What this proves:** adding `*.log` to `.gitignore` **did not**
remove `build_output.log` from tracking — `git ls-files` still listed
it right after that commit. It **did** immediately block a genuinely
*new* `.log` file (`second.log`) from being added at all. Only the
explicit `git rm --cached build_output.log` — a real, separate command
— actually untracked the already-committed file, and it did so while
leaving the real file itself completely intact on disk (`cat` still
shows its original content) — `--cached` removes a file from Git's
tracking only, never from the real filesystem.

## Mechanical Walkthrough

- `.gitignore` contains real, plain-text **glob patterns**, one per
  line (`*.log` matches any file ending in `.log`, anywhere in the
  repository unless scoped with a leading `/`).
- Git consults `.gitignore` at the moment a file is being considered
  for tracking — `git add`, or `git status`'s own untracked-files
  listing — and simply **skips** any matching, not-yet-tracked file.
- A file **already tracked** (already present in Git's own internal
  index from a prior `git add`/`commit`) is not affected by a
  `.gitignore` rule at all — Git doesn't re-check already-tracked files
  against ignore rules on every commit; ignore rules only gate *new*
  additions.
- `git rm --cached <path>` removes a file from Git's tracking (its
  index) **without** deleting the real file from the working directory
  — the correct, real command specifically for "stop tracking this,
  but don't touch the actual file," as opposed to plain `git rm`, which
  removes both.

## CS Lens

This is a real, deliberate separation between a **rule about future
behavior** (`.gitignore`, consulted only when deciding whether to
track something new) and **existing recorded state** (an already-
committed file, sitting in Git's own history and index regardless of
what any current rule says). The same real shape recurs anywhere a
policy is checked only at the *point of entry* rather than
retroactively re-applied to everything already inside a system — a
firewall rule added today doesn't retroactively close connections
already established before the rule existed.

Also recognized in: a database `CHECK` constraint added to an existing
table (new rows are validated against it; rows already present when
the constraint was added are **not** automatically re-validated unless
explicitly told to); a validation rule added to a form (doesn't
retroactively flag already-submitted, previously-valid data).

## SE Lens

The real, practical incident this project's own history shows: a
generated build artifact (`.egg-info/`, produced by installing the
project) got accidentally committed at one step, and the actual fix
required **two** real, separate actions — removing the already-tracked
files (`git rm --cached`, or an equivalent bulk removal) *and* adding
the `.gitignore` rule to prevent it recurring. Adding only the ignore
rule would have left the stale, already-tracked artifact sitting in the
repository indefinitely, still showing up in every future `git status`
and `git diff` as if nothing had been fixed at all.

## Connection

Directly resolves a real, honest gap named earlier in this project's
own history — a generated build-metadata directory that got
accidentally committed, deliberately left unfixed at the moment it was
first noticed, and resolved here with exactly this file's own two-part
pattern.

## Try It Yourself

1. Add a directory-scoped pattern (`build/` instead of `*.log`) and
   confirm it ignores an entire real directory's contents, including
   files added to it later, without needing a wildcard extension match.
2. Use `git status --ignored` to list files Git is actively ignoring —
   confirm `second.log` appears there, distinct from both tracked and
   ordinary untracked files.
3. Try `git add -f second.log` (the `-f`/`--force` flag Git's own hint
   message suggested) and confirm it genuinely overrides the ignore
   rule for that one, explicit call — a real, deliberate escape hatch,
   worth using sparingly and consciously.
