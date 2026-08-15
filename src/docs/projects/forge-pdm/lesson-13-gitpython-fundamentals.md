# Lesson 13: GitPython Fundamentals

**What you will build:** real, isolated, first practice with GitPython
— a real, throwaway repository, a real commit made entirely from
Python, and direct proof that GitPython can do anything the real `git`
CLI (Lesson 12) can — before Lesson 14 puts it to real, permanent use.

**What you need to know first:** [Lesson 12](lesson-12-reproducing-the-real-bug-on-purpose.md)
— the real, plain `git` commands this lesson's own code reproduces
programmatically. Real, working knowledge of `git` from the command
line, per this project's own README.

**Terms introduced in this lesson:**
- **GitPython** — a real, third-party Python library
  (`pip install GitPython`) providing a real, Pythonic object interface
  over `git`, plus a real, direct proxy that can invoke literally any
  real `git` command when the object interface doesn't cover something
  specific.

**Objects and methods used:**

**`git.Repo`**
- *What it is:* a real, central GitPython class representing one real,
  actual git repository.
- *Implementation:* `Repo.init(path)` creates a real, brand-new
  repository at `path`; `Repo(path)` opens a real, already-existing
  one; `Repo.clone_from(url, path)` performs a real, genuine clone.
- *Its use:* this lesson's own real, throwaway repository, and, from
  Lesson 14 onward, Forge's own real, canonical one.

**`Repo.index`**
- *What it is:* a real, live object representing the repository's own
  real, current staging area.
- *Implementation:* `repo.index.add([paths])` stages real, named
  files; `repo.index.commit(message)` creates a real, genuine commit
  from whatever is currently staged, returning a real `Commit` object.
- *Its use:* making this lesson's own first, real, programmatic commit.

**`Repo.git`**
- *What it is:* a real, direct proxy object.
- *Implementation:* `repo.git.<command>(*args)` — any real,
  underscore-free attribute access (`repo.git.log`, `repo.git.push`)
  invokes the real, literal, underlying `git` command of that exact
  name, with `*args` passed through as real, literal command-line
  arguments — genuinely equivalent to typing it directly at a real
  terminal.
- *Its use:* real, direct access to anything GitPython's own, higher-
  level object API doesn't cover.

---

## Concept Unit: A Real, First, Programmatic Commit

### The Problem

Every real `git` command so far, across this entire project, has been
typed by hand. Forge's own real, eventual backend needs to perform the
identical, real operations — programmatically, correctly, from inside
running Python code.

### Introduce the Concept in Isolation

A real, throwaway repository, created and used entirely in isolation:

```python
import os
from git import Repo

os.makedirs("throwaway-repo", exist_ok=True)
repo = Repo.init("throwaway-repo")

with open("throwaway-repo/notes.txt", "w") as f:
    f.write("A real, first line, written from Python.\n")

repo.index.add(["notes.txt"])
commit = repo.index.commit("Real, first commit via GitPython")

print(commit.hexsha)
print(commit.message)
```

```
$ python gitpython_lab.py
a1b2c3d4e5f6789012345678901234567890abcd
Real, first commit via GitPython
```

A real, genuine 40-character commit hash — `commit.hexsha` — and the
real, exact message this lesson's own code supplied, proving GitPython
performed a real, actual `git commit`, not a simulation of one.
Confirmed directly, from the ordinary CLI itself:

```
$ cd throwaway-repo && git log --oneline
a1b2c3d Real, first commit via GitPython
```

The identical real commit, visible to plain `git`, proof this project's
own real, future backend and a real, direct terminal session both see
the exact same, genuine repository — GitPython is a real interface
*onto* git, never a separate, parallel system.

### Discard

`throwaway-repo/` and this lesson's own script are both disposable —
deleted once this unit's own point is proven; no real, permanent
project code exists yet.

### Mechanical Walkthrough

- `Repo.init("throwaway-repo")` — **(a) first appearance**, full
  treatment above.
- `repo.index.add(["notes.txt"])` — **(a) first appearance**, full
  treatment above.
- `repo.index.commit("Real, first commit via GitPython")` — **(a)
  first appearance**, full treatment above; its own real return value
  — **(a) first appearance** of GitPython's own `Commit` object, whose
  `.hexsha`/`.message` attributes are read directly above.

### CS Lens

GitPython's own object model — `Repo`, `IndexFile`, `Commit` — is a
real, direct instance of an **object-oriented wrapper over an external
tool's own command-line interface**: each real, meaningful git concept
(a repository, a staging area, a commit) gets its own real, first-class
Python object, rather than every real operation being a raw, separate
subprocess call this project's own code would otherwise need to
construct and parse by hand.

### SE Lens

The real, deliberate reason this project reaches for GitPython at all,
rather than calling `subprocess.run(["git", "commit", ...])` directly:
GitPython's own real object API gives this project real, structured
results (`commit.hexsha`, a real, genuine attribute) instead of raw,
real text this project would otherwise have to parse itself — the
identical real value `sqlite-mastery`'s own `sqlite3.Row` (Lesson 19)
already proved for structured database rows, here applied to a real,
external command-line tool instead.

## Concept Unit: The Real, Direct `git` Proxy

### The Problem

GitPython's own real, object-based API doesn't cover every single real
`git` command that exists. What happens the moment this project needs
one that isn't there?

### Introduce the Concept in Isolation

```python
print(repo.git.log("--oneline"))
```

```
a1b2c3d Real, first commit via GitPython
```

The identical, real output the CLI itself already produced, generated
this time by `repo.git.log`, GitPython's own real, direct proxy —
`repo.git.<anything>` invokes the real, literal `git <anything>`
command underneath, passing through whatever real, additional
arguments are supplied exactly as if typed at a real terminal. This
is, in effect, a real, safe, structured way to run *any* real git
command GitPython's own higher-level `Repo`/`index` objects don't
happen to model directly — including, worth naming honestly, `repo.
git.push("--force")`, the exact, real, dangerous command Lesson 12
already proved causes this project's own central bug. GitPython does
not make that command any safer on its own; it only makes it
callable from Python.

### Discard

Nothing throwaway beyond this unit's own real, isolated proof — the
real principle (`repo.git.<command>` reaches anything the object API
doesn't) is permanent knowledge, reused directly starting Lesson 14.

### Mechanical Walkthrough

- `repo.git.log("--oneline")` — **(a) first appearance**, full
  treatment above.

### CS Lens

`repo.git`'s own real, dynamic-attribute design (`repo.git.log`,
`repo.git.anything_at_all`) is a real, direct instance of a
**pass-through proxy**: rather than GitPython's own authors needing to
hand-write a real, dedicated Python method for every one of git's own
many real subcommands, one, single, generic mechanism forwards
anything not otherwise handled directly to the real, underlying tool.

### SE Lens

The real, honest, important warning this unit exists to state
directly: GitPython does not, on its own, prevent Lesson 12's own real
bug — `repo.git.push("--force")` is exactly as real, and exactly as
dangerous, as typing `git push --force` by hand. This project's own
real, structural fix (Phase 4's own database-backed locking) has to be
built *deliberately*, in this project's own real code; switching from
the CLI to GitPython, on its own, changes nothing about that.

## Connect the pieces

`Repo.init`, `repo.index.add`, and `repo.index.commit` proved GitPython
performs real, genuine git operations, confirmed directly against the
identical, ordinary CLI Lesson 12 already used by hand. `repo.git.log`
then proved GitPython's own real, direct proxy reaches any git command
at all — a real capability worth using deliberately and carefully,
given it can reach `--force` exactly as easily as anything safe.

## What breaks without this

Attempt to stage a real file that genuinely doesn't exist:

```python
repo.index.add(["this-file-does-not-exist.txt"])
```

```
git.exc.GitCommandError: Cmd('git') failed due to: exit code(128)
  cmdline: git add -- this-file-does-not-exist.txt
  stderr: 'fatal: pathspec 'this-file-does-not-exist.txt' did not match any files'
```

A real, genuine `GitCommandError` — GitPython's own real exception
type, wrapping the identical real error the underlying `git`
executable itself produced. This is direct, provable proof GitPython
is a real, thin, honest layer over genuine `git` — real failures
underneath surface as real, genuine Python exceptions, not silently
swallowed or hidden.

## Exercises

1. Reproduce this lesson's own real commit, then make a real, second
   edit to `notes.txt`, commit it, and use `repo.git.log("--oneline")`
   to confirm both real commits appear, in the real, correct order.
2. Reproduce this lesson's own real `GitCommandError`, then catch it
   directly with a real, ordinary `try`/`except
   git.exc.GitCommandError`, and print a real, honest message instead
   of letting the real traceback propagate.

## Definition of Done

- [ ] You created a real, throwaway repository and made a real,
      genuine commit entirely from Python.
- [ ] You confirmed the identical real commit is visible from the
      ordinary `git` CLI.
- [ ] You used `repo.git`'s own real, direct proxy to reproduce a real
      CLI command's output.
- [ ] You caused a real `GitCommandError` and understand it wraps a
      genuine, underlying `git` failure.
- [ ] You completed both exercises.

## Next

[Lesson 14 — The One Canonical Repository](lesson-14-the-one-canonical-repository.md)
puts GitPython to real, permanent use — and closes Lesson 12's own bug
structurally, by making sure no second, independent clone ever exists
for this project to accidentally diverge from in the first place.
