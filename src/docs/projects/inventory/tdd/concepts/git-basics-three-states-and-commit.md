# Concept: Git's Three States, and What a Commit Actually Is

**What you'll understand by the end:** the real difference between a
modified, staged, and committed file, and what `git commit` actually
records when you run it.

**Prerequisites:** none.

## Setup

Git installed and available on your PATH. A terminal.

## The Problem

Version control needs to answer a real question precisely: *when* does a
change to a file actually become part of the project's permanent history?
"The moment you save the file" is too eager — you'd have no chance to
group related changes together or leave a file half-edited without it
becoming official. "Only when you explicitly say so" is closer, but still
needs two distinct steps: choosing *which* changes belong together, and
then actually recording them.

## The Isolated Example

```
mkdir git-demo && cd git-demo
git init
echo "version 1" > notes.txt
git status
```

**Real output (the last command):**
```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt
```

Now stage it and check again:
```
git add notes.txt
git status
```

**Real output:**
```
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   notes.txt
```

Now commit it, change the file again, and check a third time:
```
git commit -m "Add notes.txt"
echo "version 2" >> notes.txt
git status
```

**Real output:**
```
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)
	modified:   notes.txt
```

**What this proves:** the exact same file, `notes.txt`, produced three
genuinely different `git status` reports — "untracked," "changes to be
committed," and "modified" — depending only on which of the three real
steps (`init`, `add`, `commit`) had been run so far. Git isn't guessing
at your intent; it's reporting one of three real, distinct states the
file actually occupies right now.

## Mechanical Walkthrough

- `git init` creates a hidden `.git/` folder in the current directory —
  an empty, real repository with no commits yet. This is run exactly
  once per project, ever.
- **Modified**: you changed a tracked file, but haven't told git about it
  yet. Git can see the file differs from its last commit, but nothing
  about that change is queued for the next snapshot.
- **Staged** (`git add <file>`): you've explicitly told git "include
  this file's current content in the next commit." Staging is a real,
  separate holding area — you can stage some changed files and leave
  others modified-but-unstaged, choosing exactly what goes into the next
  snapshot.
- **Committed** (`git commit -m "..."`): git takes everything currently
  staged and writes it permanently into the project's history as one
  named snapshot. Only staged changes are included — a modified-but-
  unstaged file is left out of the commit entirely, still sitting there
  modified afterward.

## Execution Trace

One file, three real state transitions, traced against the exact
commands and output above:

- git init                    → notes.txt doesn't exist yet
- echo "version 1" > notes.txt → notes.txt exists, git has never seen it: UNTRACKED
- git add notes.txt           → git now has "version 1" queued: STAGED
- git commit -m "..."         → "version 1" written to history permanently.
                               Staging area cleared. File now: unmodified,
                               matches the last commit exactly.
- echo "version 2" >> notes.txt → file content now differs from the last
                               commit, nothing staged for it: MODIFIED

Each transition happened because of exactly one command — staging didn't
happen automatically when the file changed, and committing didn't happen
automatically when the file was staged. Every transition is a deliberate,
separate step.

## CS Lens

This is a real **two-phase commit pattern**: changes are first
*prepared* (staged) — gathered into exactly the set you intend to commit
— and only then *finalized* (committed) as one atomic operation. Splitting
"decide what belongs together" from "make it permanent" is what lets you
build one commit out of edits to several different files, made at
different times, without those edits needing to have happened together.

Also recognized in: database transactions (`BEGIN` ... stage several
statements ... `COMMIT` makes them all real at once), a shopping cart
(adding items is staging; checkout is the commit), and any "review
before applying" step in real software.

## SE Lens

The alternative — every save is automatically permanent history, with no
staging step — would remove your ability to group related changes into
one meaningful commit, or to leave an unrelated in-progress edit out of
the commit you're about to make. Staging exists specifically so a commit
can represent one coherent, complete idea ("add the login form"), not
just "whatever happened to be different on disk when you ran the
command."

A commit's message is not a list of which files changed — `git log`
already shows that automatically, per file. It's an explanation of *why*
this snapshot exists, for whoever reads the history later (often you,
months from now, with no memory of this specific session).

## Connection

`.gitignore` (`gitignore-pattern-file.md`) controls a different question
entirely — which files git considers at all — while this file covers
what happens to a file git *is* tracking. A file matched by `.gitignore`
never enters the untracked/staged/committed cycle described here in the
first place.

## Try It Yourself

1. Stage a file, then run `git restore --staged <file>` before
   committing. Confirm `git status` reports it back to modified, not
   committed — staging is fully reversible up until the commit itself.
2. Modify two files, stage only one, and commit. Run `git status`
   afterward and confirm the unstaged file is still reported as
   modified — proof a commit only ever includes what was actually
   staged for it, not everything that happened to be different.
3. Run `git log` after a few commits and read what's stored for each
   one: an author, a timestamp, and the message — but never a literal
   list of changed lines inline; that's reconstructed on demand by
   comparing snapshots, not stored as a diff itself.
