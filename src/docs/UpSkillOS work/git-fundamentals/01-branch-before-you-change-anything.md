# Branch Before You Change Anything

**Case study:** today's session. We made a large batch of changes directly on
`main` — a topic/subtopic explore rebuild, a search-system removal, several
bug fixes — before realizing partway through that we should have isolated
all of it on its own branch first. This lesson is that mistake, worked
backward into a repeatable procedure, so it doesn't happen the same way
twice.

---

## What you will build

By the end of this lesson you will have run the full branch → commit →
merge → push → cleanup cycle yourself, on a disposable practice repository
where nothing you do can break anything real. You'll see exactly what a
branch *is* underneath the command (not just what it does), why a
fast-forward merge is safe and instant, and the specific recovery move for
today's mistake — realizing you're already mid-change on `main` with no
branch. Then we connect every step back to the real commands run on
`open-calc` today.

## What you need to know first

Nothing beyond being able to run commands in a terminal and that this
project already uses git. If you've never had `git commit`, `add`, or
`branch` explained to you before, they're explained here at first use —
this lesson doesn't assume you've absorbed them elsewhere.

---

## The Lesson

### Concept Lab: what a commit actually is

Before touching `open-calc`, we build the concept somewhere disposable —
a folder that exists for the next ten minutes and is deleted at the end.
Nothing in this lab becomes part of any real project.

```bash
mkdir ~/git-lab && cd ~/git-lab
git init
```

**Walkthrough:** `mkdir ~/git-lab` creates an empty folder. `cd` moves your
terminal into it. `git init` — **`init`** is short for *initialize*; it
creates a hidden `.git/` folder inside `git-lab` that will hold every
version of every file you ever commit here. Nothing outside `.git/` is
touched. This folder is now, and only now, "a git repository" — before
`git init`, it was just a folder.

```bash
echo "first draft" > notes.txt
git add notes.txt
git commit -m "add notes"
```

**Walkthrough:** `echo "first draft" > notes.txt` writes the text `first
draft` into a new file called `notes.txt`. `git add notes.txt` — this is
the **staging area**: a file that exists but hasn't been `add`-ed yet is
just sitting in your folder, invisible to git's history; `add` tells git
"include this file's *current* contents in the next commit." `git commit
-m "add notes"` takes everything currently staged and seals it into a
permanent, named snapshot, with `"add notes"` as the message explaining why.

**CS lens:** A commit is not a diff and not a copy of the whole project —
it's a **content-addressed snapshot**. Git hashes the exact contents of
every staged file; if two commits both contain a file with byte-for-byte
identical content, git stores that content exactly once and both commits
point at it. Each commit also stores a pointer to the commit that came
immediately before it. String enough commits together and you get a
**directed acyclic graph (DAG)** — a chain (or, once you branch, a
tree) of snapshots, each one aware of its own history.

**SE lens:** This is why commits are cheap and safe to make often. You are
never duplicating the whole project — you're recording "here is exactly
what changed, and why," in a form that can be inspected, reverted, or
compared against any other point in the history, forever. A team's entire
shared understanding of *how the code got to be what it is* lives in this
graph.

Run this to see it:

```bash
git log --oneline
```
```
a1b2c3d add notes
```

**Execution trace** — one commit exists, `notes.txt` contains `first
draft`. Now change it and commit again:

```bash
echo "second draft" > notes.txt
git add notes.txt
git commit -m "revise notes"
git log --oneline
```
```
e5f6a7b revise notes
a1b2c3d add notes
```

Two snapshots now exist in the DAG: `a1b2c3d` (where `notes.txt` said
"first draft") and `e5f6a7b` (where it says "second draft"), with `e5f6a7b`
pointing back at `a1b2c3d` as its parent. Nothing about `a1b2c3d` changed —
it's still sitting there, permanently, provably saying "first draft." That
permanence is the entire point: you can always go back and look.

This lab code is now done its job. We don't delete the folder yet — the
next lab reuses it to show what a branch actually is — but nothing here
will ever be copied into `open-calc`.

---

### Concept Lab: what a branch actually is

Still in `~/git-lab`. Run:

```bash
git branch
```
```
* main
```

**Define at use — `main`:** when you ran `git init`, git automatically
created one starting branch and named it `main` by default (older
repositories may call this `master` — same concept, older convention).
The `*` marks which branch you currently have checked out.

Now:

```bash
git branch feature-branch
git branch
```
```
  feature-branch
* main
```

**Walkthrough:** `git branch feature-branch` created a second branch named
`feature-branch`. The `*` is still on `main` — creating a branch does not
switch you onto it.

**CS lens — this is the part that surprises people:** a branch is **not**
a copy of the project. It is a single 40-character pointer — literally
just a name that stores one commit's hash — sitting in `.git/refs/heads/`.
Run `cat .git/refs/heads/feature-branch` and you'll see it holds the exact
same hash as `main` right now (`e5f6a7b`, whatever your commit's real hash
is): both names currently point at the *same* commit. That's why creating
a branch is instant regardless of how large the project is — you're
writing one line into one small file, not duplicating any project files.

**SE lens:** because a branch costs nothing to create, professional
practice treats it as free to use liberally — one per feature, one per
bug fix, one per experiment you might throw away. The cost isn't in
*creating* branches; it's in letting unrelated work pile up uncommitted
on a shared branch like `main`, which is exactly what happened at the
start of today's session.

Switch onto it and make a change:

```bash
git checkout feature-branch
echo "third draft, on the branch" > notes.txt
git add notes.txt
git commit -m "branch-only change"
```

**Define at use — `checkout`:** `git checkout <branch>` moves the `*` —
which branch you're "on" — and updates every file in your working folder
to match that branch's most recent commit. Here it didn't change any
files (both branches pointed at the same commit at that moment), but it
did make `feature-branch` the one that new commits will attach to.

**Execution trace** — before this commit, `main` and `feature-branch` both
pointed at `e5f6a7b`. After it:

```
main:           e5f6a7b (revise notes)
feature-branch: f8g9h0i (branch-only change)  ← new commit, parent = e5f6a7b
```

Prove `main` is untouched:

```bash
git checkout main
cat notes.txt
```
```
second draft
```

**This is the whole safety guarantee, made concrete.** `notes.txt` on
`main` still says `"second draft"` — the branch commit never touched it.
You could delete `feature-branch` entirely right now (`git branch -D
feature-branch`) and `main` would be exactly as if the branch never
existed. That reversibility is what "branch before you change anything"
actually buys you.

---

### Fast-forward merge: bringing the branch back in

```bash
git merge --ff-only feature-branch
cat notes.txt
```
```
third draft, on the branch
```

**Walkthrough:** `main` didn't gain a new commit that combines two
histories — it simply moved its pointer forward, from `e5f6a7b` to
`f8g9h0i`, along the same line `feature-branch` had already extended.

**CS lens — why "fast-forward" is the right word:** this only works when
`main`'s pointer is an ancestor of the branch's pointer — i.e., nothing
new was committed to `main` while you were working on the branch. If that
condition holds, merging is not really a *merge* at all, computationally —
it's a pointer reassignment, `O(1)`, no new commit object created. `--ff-only`
tells git to *only* do this and to refuse — loudly — if it can't, rather
than silently falling back to something more complicated.

**SE lens:** this is why the workflow always checks
`git merge-base --is-ancestor main <branch>` before merging (we did this
exact check on `open-calc` today) — it's asking, in one command, "will this
be a clean fast-forward?" If yes, there's no possibility of a conflict. If
no, someone else's commits landed on `main` while you were on your branch,
and you need to reconcile that deliberately rather than let git guess.

You're done with the lab. Delete it — it was never going anywhere else:

```bash
cd ~ && rm -rf ~/git-lab
```

---

### Now the real recovery move: you're already mid-change on `main`

This is exactly what happened today. You have uncommitted edits sitting on
`main`, and you realize — too late to have branched *first* — that they
should be isolated. The fix:

```bash
git status                # confirms: modified files, currently on main
git checkout -b topic-explorer
git status                # main's uncommitted changes moved with you
```

**Walkthrough:** `checkout -b <name>` is `git branch <name>` and
`git checkout <name>` fused into one command. The critical detail: your
**uncommitted** changes are not attached to any commit yet, so they have
no branch of their own — they simply live in your working folder and
travel with you to whatever branch you're currently on. The moment you
run this, `main` goes back to being exactly its last committed state, and
`topic-explorer` is the one holding your in-progress work.

**This only works for uncommitted changes.** If you'd already run
`git commit` directly on `main`, the commit itself would be attached to
`main`'s history, and moving it to a new branch requires `git reset` to
detach it first — a more delicate operation, worth asking about rather
than guessing at, since it rewrites which commits a branch points to.

---

## Connect the pieces

Here's exactly what we ran on `open-calc`, mapped straight onto everything
above:

```bash
git checkout -b topic-explorer      # caught mid-session, exactly like the recovery move above

git add src/data/topicGroups.js src/components/ui/TopicTable.jsx \
        src/components/ui/ItemInfoModal.jsx src/pages/HomePage.jsx
git commit -m "feat: two-level topic/subtopic Explore section with global search"
# ...four more commits, each one a self-contained piece of the work...

git log main..topic-explorer                                        # preview
git merge-base --is-ancestor main topic-explorer && echo "clean ff"  # confirmed: yes
git checkout main
git merge --ff-only topic-explorer   # the exact fast-forward you just watched in the lab
git push origin main
git branch -d topic-explorer         # -d refuses to delete if work isn't fully merged — a guardrail
```

Five separate commits landed instead of one giant one, for the same reason
the lab kept each commit small: `git log` is now a real changelog — "what
changed in the search removal" is a one-line lookup instead of a 900-line
diff, and if something breaks later, `git bisect` can point at exactly
which of the five caused it instead of one commit labeled "everything."

## Recognition

The idea underneath a branch — **a cheap, movable pointer to something
immutable, that you can redirect without touching the thing it points
at** — isn't unique to git. You'll meet it again in:

- A **CNC program's active tool offset**, which points at whichever row of
  the tool table is currently selected — changing tools reassigns the
  pointer, it doesn't rewrite the tool table.
- A **filesystem symbolic link**, which points at a file path and can be
  repointed at a different target without moving or copying any data.
- A **database transaction log's checkpoint**, marking "everything up to
  here is durable" — advancing it is cheap; the underlying log entries
  never move.
- An **undo/redo stack**, where "current position" is a pointer sliding
  along a sequence of recorded states, not a copy of the state itself.

## What breaks without this

Picture today's session with every change committed straight onto `main`
as it happened — the topic explorer, then partway through, an unrelated
PR emergency needing an urgent fix pushed *immediately*, then more topic
explorer work after that. There would be no way to push just the PR fix
without also pushing half-finished explorer work sitting in the same
uncommitted pile — `main` would sit in a broken, half-done state for
however long the rest of the session took, with no clean point to roll
back to if anything needed to be abandoned. Branching is what let the PR
fix ship on its own, cleanly, while the explorer work waited untouched on
its own branch until it was actually ready.

## Definition of done

- [ ] You ran every command in the two concept labs yourself, in a real
      disposable folder, and watched `git log --oneline` and `cat
      notes.txt` change at each step
- [ ] You can explain, in your own words, why creating a branch is instant
      regardless of project size
- [ ] You can explain the difference between `git checkout <branch>` and
      `git checkout -b <branch>`
- [ ] You know the recovery move for "I already have uncommitted changes
      on `main` and should have branched first"
- [ ] Next time you start a real change on `open-calc`, you open with
      `git checkout -b <feature-name>` — before editing anything — and
      commit this lesson file with a message explaining why it exists:

```bash
git add "src/docs/UpSkillOS work/git-branch-workflow/01-branch-before-you-change-anything.md"
git commit -m "docs: branch-before-changes lesson, written from today's actual mistake"
```
