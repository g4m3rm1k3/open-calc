# Lesson 12: Reproducing the Real Bug, On Purpose

**What you will build:** the exact, real failure this entire project
exists to fix — two independent clones, two real edits to the same
file, one real, silent overwrite — reproduced deliberately, using
nothing but plain, ordinary `git` from the command line, before a
single real line of this project's own code is involved at all.

**What you need to know first:** real, working knowledge of `git` from
the command line, per this project's own [README](README.md). Nothing
about GitPython is assumed yet — that's Lesson 13's own real subject,
deliberately taught only *after* this lesson proves, concretely, why it
matters.

**Terms introduced in this lesson:**
- **Fast-forward** — a real, git-specific term: a real branch can move
  forward safely, with no real merge needed, only when its own new tip
  is a direct, real descendant of where it currently points. Git's own
  real, default push behavior refuses anything else.
- **Force push** (`git push --force`) — a real, standard `git` flag
  that explicitly overrides that same, real, default protection,
  replacing the remote branch's own real history with the local one,
  unconditionally.

**Objects and methods used:** none new — this lesson uses only real,
ordinary `git` commands, run directly, with no real Python code at all.

---

## Concept Unit: Git's Own Real, Default Protection

### The Problem

This project's own real README already names the bug directly: two
people, two independent clones, one silent overwrite. Before writing a
single real line of code to prevent it, it's worth confirming something
real and important first: is *plain git itself* actually this
careless, or does the real bug require something more?

### Introduce the Concept in Isolation

A real, minimal, three-repository setup — one real, shared, bare
repository standing in for a real, central server, and two real,
independent clones:

```
$ git init --bare shared-repo.git
$ git clone shared-repo.git alice-clone
$ git clone shared-repo.git bob-clone
```

Alice, working entirely inside her own real clone, makes a real,
genuine change and pushes it:

```
$ cd alice-clone
$ echo "Tolerance updated to +/-0.005 per engineering review." > bracket-notes.txt
$ git add bracket-notes.txt
$ git commit -m "Alice: update tolerance note"
$ git push
```

Bob, working inside his own, entirely separate real clone — never
having seen Alice's real change, because he never pulled after she
pushed — edits the identical real file and attempts to push his own,
different, real change:

```
$ cd ../bob-clone
$ echo "Material changed to 6061-T6 aluminum." > bracket-notes.txt
$ git add bracket-notes.txt
$ git commit -m "Bob: update material note"
$ git push
```

```
To shared-repo.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'shared-repo.git'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. This is usually caused by another repository pushing
hint: to the same ref. You may want to first integrate the remote changes
hint: (e.g., 'git pull ...') before pushing again.
```

A real, genuine rejection — not a silent overwrite. Plain git, used
exactly as designed, refuses Bob's own real push outright, because it
is not a real **fast-forward**: the shared repository's own real `main`
already moved past where Bob's own local branch still thinks it is.
Bob's own real work is never lost here — it sits, safely, in his own
local clone, exactly where he left it, until he does what the real
hint already tells him to: pull, merge or rebase, and push again.

### Discard

Not applicable — this real setup is the direct, permanent foundation
this lesson's own second unit builds its own real proof on top of.

### Mechanical Walkthrough

- `git init --bare shared-repo.git` — **(a) first appearance** of a
  real, **bare** repository: one holding only git's own real, internal
  history, no real, checked-out working files at all — the correct,
  standard real shape for a repository meant to be pushed to and
  pulled from, never edited directly.
- `git clone shared-repo.git alice-clone` — **(c) already basic**,
  ordinary, already-known `git clone`.
- `git push` (Bob's, rejected) — **(c) already basic** as a command;
  its real, refused *result* is this unit's own entire point, not new
  syntax.

### CS Lens

Git's own real, default push protection is a direct, concrete instance
of **optimistic concurrency control**: rather than locking anything in
advance (the real, opposite approach Phase 4's own database-backed
checkout system deliberately takes instead), git lets both Alice and
Bob work freely, and only checks for a real conflict at the one, real
moment it actually matters — the push — refusing outright rather than
silently merging or guessing.

### SE Lens

The real, honest, important conclusion this unit already reaches,
before this lesson's own second unit even begins: plain, ordinary git,
used correctly, is not the real, direct cause of this project's own
central bug. Something else — this lesson's own next, real,
deliberate step — has to actively defeat this real protection for the
original, silent-overwrite failure to actually occur.

## Concept Unit: The Real, Common Way This Protection Gets Defeated

### The Problem

Git refused Bob's own real push. A real, working system built around
git nonetheless produced the identical, real, silent-overwrite bug this
project exists to fix. What, concretely, closes that real gap?

### Introduce the Concept in Isolation

The single, most real, common response to a real, rejected push, from
someone who doesn't yet know — or doesn't stop to think about — what
the rejection actually means:

```
$ git push --force
```

```
To shared-repo.git
 + a1b2c3d...e4f5g6h main -> main (forced update)
```

A real, "successful" push — no error at all this time. `--force`
explicitly, deliberately overrides git's own real protection from this
lesson's own first unit, replacing the shared repository's own real
history with Bob's local one, unconditionally, regardless of what it
overwrites.

The real, exact, silent cost, confirmed directly — back in Alice's own
clone:

```
$ cd ../alice-clone
$ git fetch
$ git log origin/main --oneline
a1b2c3d Bob: update material note
```

Alice's own real commit — "update tolerance note" — is gone.
Not merged, not conflicted, not flagged in any real way: `origin/main`
now shows only Bob's own real commit, as if Alice's real, genuine
engineering review note had simply never happened. This is the exact,
real bug this entire project exists to fix, reproduced precisely, on
purpose, using nothing but two real, ordinary `git` commands.

### Discard

`shared-repo.git`, `alice-clone`, and `bob-clone` are all real,
disposable proof — deleted once this lesson's own point is made; no
real, permanent project code exists yet.

### Mechanical Walkthrough

- `git push --force` — **(a) first appearance**, full treatment above.
- `git log origin/main --oneline` — **(a) first appearance** of `git
  log`'s own real, condensed `--oneline` form, used here specifically
  to make Alice's own real, missing commit immediately, visibly
  obvious.

### CS Lens

`--force` is a real, direct instance of **overriding a safety
invariant explicitly** — git's own real protection is not a bug that
allowed this; it is a real, deliberate escape hatch, genuinely useful
in real, legitimate, narrow cases (rewriting a real, private, not-yet-
shared branch), and genuinely catastrophic the instant it's reached for
as a generic fix for "my push isn't working," without first
understanding *why* it was refused.

### SE Lens

The real, honest, central lesson this project is built around, stated
directly: this project's own real, existing bug is very unlikely to be
"git is unreliable" — it is far more likely to be a real, specific
place, somewhere in real, existing code (very plausibly written, or
"fixed," by an AI agent encountering this exact, real rejection and
reaching for the fastest way to make the real error go away), where a
push failure was silently forced through, or never checked at all.
Phase 4's own real, database-backed locking (not git's own push
protection) is this project's own real, deliberate, structural answer
— preventing the real conflict from *ever occurring* in the first
place, rather than depending on every real caller, forever, correctly
handling a rejection instead of forcing past it.

## Connect the pieces

Plain git, used correctly, proved itself genuinely safe — Bob's own
real push, correctly rejected, cost him nothing. `git push --force`,
the real, common, tempting response to that same, real rejection, then
reproduced this project's own exact, central bug directly: Alice's own
real, genuine work, silently, permanently gone from the shared
repository's own real history, with no error, no warning, and no real
record it ever existed.

## What breaks without this

Not applicable in this lesson's own usual sense — this entire lesson
*is* the real, deliberate "what breaks" demonstration this whole
project exists to fix.

## Exercises

1. Reproduce this lesson's own real sequence yourself, then try the
   real, correct alternative at the exact point Bob's own push was
   first rejected: `git pull --rebase`, followed by resolving the real,
   resulting conflict in `bracket-notes.txt` by hand, keeping *both*
   real notes — confirm a real, ordinary `git push` afterward succeeds,
   with neither Alice's nor Bob's own real work lost.
2. Search your own project's own real, existing codebase (the one this
   whole series was written to help you understand and fix) for the
   real, literal string `--force`, or `force=True` if it calls a real
   git library instead of shelling out — write down, honestly, whether
   you find it, and where.

## Definition of Done

- [ ] You reproduced git's own real, default push rejection and
      confirmed it costs no real work at all.
- [ ] You reproduced the real, exact silent-overwrite bug using
      `git push --force`, and confirmed the real, lost commit directly.
- [ ] You completed both exercises, including a real, honest search of
      your own actual, existing project.

## Next

[Lesson 13 — GitPython Fundamentals](lesson-13-gitpython-fundamentals.md)
gives you real, first, isolated practice with the tool this project
uses to prevent this lesson's own exact bug structurally — before
Lesson 14 makes that prevention permanent.
