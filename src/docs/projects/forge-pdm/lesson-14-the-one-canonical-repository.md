# Lesson 14: The One Canonical Repository

**What you will build:** Forge's own real, permanent, single git
repository — opened and written to only by this project's own backend
process, never by a second, independent clone — structurally closing
Lesson 12's own exact bug, plus direct, honest proof of the real,
remaining gap that fix does *not* close on its own.

**What you need to know first:** [Lesson 12](lesson-12-reproducing-the-real-bug-on-purpose.md)
— the real bug this lesson's own architecture prevents structurally.
[Lesson 13](lesson-13-gitpython-fundamentals.md) — GitPython's own real
mechanics, now put to real, permanent use for the first time.

**Terms introduced in this lesson:** none new — **canonical
repository** already has full, real treatment in this project's own
[README](README.md); this lesson gives it real, permanent code.

**Objects and methods used:**

**`git.Actor`**
- *What it is:* a real, built-in GitPython class.
- *Implementation:* `Actor(name, email)` — a real, explicit identity to
  attach to a commit, independent of whatever real, local `git config`
  the backend process's own machine happens to have set.
- *Its use:* correctly attributing every real, permanent commit to the
  real Forge user who actually made it — Alice, or Bob — never to a
  generic, real, shared "Forge backend" identity.

---

## Concept Unit: One Real Repository, One Real Writer

### The Problem

Lesson 12's own bug required *two* real, independent clones to diverge
from each other. Structurally, the simplest real fix is refusing to let
that situation exist at all.

### Introduce the Concept in Isolation

```python
# src/data/git_repo.py
import os

from git import Actor, Repo

REPO_PATH = "canonical-repo"


def get_repo() -> Repo:
    if not os.path.exists(REPO_PATH):
        repo = Repo.init(REPO_PATH)
        open(os.path.join(REPO_PATH, ".gitkeep"), "w").close()
        repo.index.add([".gitkeep"])
        repo.index.commit("Initial commit")
        return repo
    return Repo(REPO_PATH)


def commit_file_change(repo: Repo, file_path: str, content: str, message: str, author_name: str) -> str:
    full_path = os.path.join(REPO_PATH, file_path)
    with open(full_path, "w") as f:
        f.write(content)
    repo.index.add([file_path])
    commit = repo.index.commit(
        message, author=Actor(author_name, f"{author_name.lower()}@forge.local")
    )
    return commit.hexsha
```

`REPO_PATH` is a real, single, fixed location — no real, separate
per-user clone is ever created by this project's own code, anywhere.
Every real file this project manages lives inside this exact, one, real
directory, and every real commit is made by this exact, one, real
process.

```
$ python -c "
from src.data.git_repo import get_repo, commit_file_change
repo = get_repo()
sha = commit_file_change(repo, 'bracket-notes.txt', 'Real, first note.', 'Alice: add note', 'Alice')
print(sha)
"
$ cd canonical-repo && git log --format='%H %an <%ae> %s'
b2c3d4e... Alice <alice@forge.local> Alice: add note
a1b2c3d... Forge <forge@forge.local> Initial commit
```

A real, genuine commit, correctly attributed to Alice by name and
email — proof `Actor` carries a real, specific identity through, even
though the actual `git commit` itself was performed entirely by this
project's own, single backend process, not by a real "Alice" user
account on the operating system at all.

### Discard

Nothing throwaway — `canonical-repo/`, `get_repo`, and
`commit_file_change` are all real, permanent, and reused directly for
the rest of this project.

### Mechanical Walkthrough

- `if not os.path.exists(REPO_PATH): repo = Repo.init(REPO_PATH); ...`
  — **(b) hard concept reappearing** for `Repo.init` (Lesson 13); the
  real, conditional, "create once, reuse forever" shape — **(a) first
  appearance** of this exact, real pattern, the identical real spirit
  as `sqlite-mastery`'s own `CREATE TABLE IF NOT EXISTS`.
- `Actor(author_name, f"{author_name.lower()}@forge.local")` — **(a)
  first appearance**, full treatment above.
- `commit = repo.index.commit(message, author=Actor(...))` — **(b)
  hard concept reappearing** for `repo.index.commit` (Lesson 13); the
  real, explicit `author=` keyword argument — **(a) first appearance**
  of this specific, real parameter.

### CS Lens

Confining every real write to one, single, real repository, touched by
exactly one, real, trusted process, is a direct, concrete instance of a
**single writer principle** — the identical underlying real guarantee
`sqlite-mastery`'s own Lesson 50 already proved SQLite itself enforces
at the file-locking level, applied here, deliberately, at the level of
this project's own real, architectural design instead.

### SE Lens

The real, deliberate reason this lesson never gives any client-side
process — a real, hypothetical CLI tool, a real script run by a user
directly — its own, independent clone of `canonical-repo`: the instant
a second, real, independent copy exists, Lesson 12's own exact bug
becomes possible again, regardless of how carefully this project's own
backend itself behaves. The real, structural fix is not "be more
careful with `--force`" — it's "never let a second, real, independent
copy exist to diverge from in the first place."

## Concept Unit: What This Fix Does Not Close, Yet

### The Problem

One real repository, one real writer — does that, alone, fully close
this project's own original bug?

### Introduce the Concept in Isolation

Two real, sequential calls, standing in for two real, near-simultaneous
requests — Alice and Bob, both editing the identical real file, neither
one aware of the other:

```python
from src.data.git_repo import get_repo, commit_file_change

repo = get_repo()
commit_file_change(repo, "bracket-notes.txt", "Tolerance updated to +/-0.005.", "Alice: update tolerance", "Alice")
commit_file_change(repo, "bracket-notes.txt", "Material changed to 6061-T6 aluminum.", "Bob: update material", "Bob")
```

```
$ cd canonical-repo && git log --oneline
c3d4e5f Bob: update material
b2c3d4e Alice: update tolerance
a1b2c3d Initial commit
```

A real, genuinely important improvement over Lesson 12: **both real
commits exist**, in order, permanently, in one real, unbroken history —
Alice's own real work was never force-pushed out of existence, the way
it was before. But read `bracket-notes.txt` itself, right now, as it
currently, really exists:

```
$ cat bracket-notes.txt
Material changed to 6061-T6 aluminum.
```

Alice's own real, genuine tolerance note is gone from the real, *live*
file — not destroyed, genuinely recoverable from history (`git show
b2c3d4e:bracket-notes.txt`), but silently superseded, with neither
Alice nor Bob ever told this happened. This is a real, genuinely
smaller problem than Lesson 12's own permanent, unrecoverable loss —
and it is still a real, live problem this project's own README already
promises to solve completely: nothing here yet stops Bob from silently
overwriting Alice's own, current, uncommitted intent, because nothing
here yet knows Alice was ever working on this specific file at all.

### Discard

`bracket-notes.txt`'s own real, overwritten content is disposable —
this unit's own point is proven directly by observing it, not by
keeping it around.

### Mechanical Walkthrough

- `commit_file_change(repo, "bracket-notes.txt", ..., "Alice")` /
  `commit_file_change(repo, "bracket-notes.txt", ..., "Bob")` — **(b)
  hard concept reappearing**, this lesson's own first unit, called
  twice in direct, real sequence, against the identical real file.

### CS Lens

This is a real, direct instance of a **lost update**: two real, correct
operations, each individually valid, that together silently discard one
real, legitimate change — the identical underlying real problem
`sqlite-mastery`'s own Lesson 47 already named directly (a "last write
wins" scenario), here occurring at the level of a real, live file's own
current content, not a database column.

### SE Lens

The real, honest, precise scope of what this lesson actually fixed:
Lesson 12's own bug — a genuinely *unrecoverable*, silent loss, git
history and all — is now structurally impossible, because a second,
independent, divergent clone can never exist. What remains, proven
directly above, is a real, *recoverable*, but still silent, "last
write wins" race on the *live* file — exactly the real, remaining gap
Phase 4's own database-backed checkout and locking exists to close:
not "protect git history" (already done, here, in this lesson) but
"stop Bob from ever being allowed to write to this specific file while
Alice is actively working on it at all."

## Connect the pieces

`get_repo` and `commit_file_change`, real and permanent, gave this
project exactly one, real, canonical repository, touched only by its
own backend process — structurally closing Lesson 12's own exact bug:
two real, sequential commits, from two different real users, both
survive permanently in this project's own real git history now,
unconditionally. A real, direct, honest proof then showed exactly what
this lesson alone does not yet close — a real, live, silent "last write
wins" race on the file's own current content — setting up Phase 4's
own real, remaining, necessary work precisely.

## What breaks without this

Not applicable in this lesson's own usual sense — this lesson's own
second unit already is the real, honest "what's still broken"
demonstration, deliberately, rather than a mistake to cause and fix.

## Exercises

1. Use `git show <Alice's real commit hash>:bracket-notes.txt` to
   confirm, directly, that Alice's own real tolerance note is
   genuinely still recoverable from history, even though it no longer
   appears in the live file — the real, concrete difference between
   this lesson's own real, remaining gap and Lesson 12's own true,
   permanent loss.
2. Write two or three real sentences, in your own words, describing
   exactly what Phase 4's own real, database-backed locking needs to
   prevent, now that you've seen precisely what one, canonical
   repository does and does not fix on its own.

## Definition of Done

- [ ] You built `get_repo` and confirmed it creates the real, canonical
      repository exactly once, reusing it on every later call.
- [ ] You made two real, sequential commits from two different real
      authors and confirmed both survive permanently in git history.
- [ ] You reproduced this lesson's own real, remaining "last write
      wins" gap on the live file, and can state precisely why it's a
      genuinely smaller problem than Lesson 12's, but still a real one.
- [ ] You completed both exercises.

## Next

[Lesson 15 — The File Tree](lesson-15-the-file-tree.md) gives this
project's own real, canonical repository a real, browsable view — every
real, tracked file, synced into this project's own metadata layer.
