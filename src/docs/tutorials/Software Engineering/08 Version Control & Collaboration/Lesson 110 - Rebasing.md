# Lesson 110: Rebasing

**What you will build.** A second, genuinely different way of bringing a
diverged branch back in line with `main` — `git rebase`, used to move
`add-reorder-suggestion`'s own single commit so it appears to have been
written starting from `main`'s current tip, instead of from wherever it
actually branched off. Lesson 109's `git merge` combined two histories
by creating a new commit that points at both; this lesson's `git rebase`
instead creates a new commit that *replaces* the old one, with the same
content and message but a different parent — and therefore, as this
lesson proves directly with the same `git cat-file` proof Lesson 107
first used, a completely different hash. The transferable problem this
lesson is actually about: unlike every other Git operation in this
domain so far, rebasing doesn't just add new history — it can discard
commits that already existed and already had an address, and, this
lesson's own closing demonstration proves concretely, doing that to
history someone else has already built on top of causes a real, specific
mess, not a hypothetical one.

**What you need to know first.** Lesson 109 (Merging) directly — this
lesson's entire point depends on contrasting rebasing against merging,
and assumes Lesson 109's own explanation of diverged history and merge
commits is already fully in hand. This lesson also depends completely on
Lesson 107's own proof of what a commit hash actually is — computed from
a commit's own content, which includes its parent — since that fact,
proven once already, is the entire reason rebasing changes a commit's
hash at all.

**Pipeline diagram.** Restated in full:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still **Implementation** and **Integration** — rebasing, like merging, is
a second way of reaching the same Integration stage Lesson 109 first
gave this domain's own two-engineer example a concrete arrival at.
Where Lesson 109 imagined Engineer A's and Engineer B's independent
commits combined by a merge commit holding both as parents, this lesson
offers the alternative available to either of them individually before
that merge happens: rebasing their own branch onto the latest `main`
first, so their eventual merge — or, per this lesson's own final
Concept Unit, their now-possible fast-forward — lands on top of the
most current shared history rather than the older point they originally
branched from. This lesson's own closing warning matters directly for
this same example: if Engineer A's branch has already been pushed
somewhere Engineer B (or anyone else) has already fetched from, rebasing
it is no longer a private, local decision — it's a rewrite of history
someone else may already be depending on.

**Terms used in this lesson.**

- **rebase** — replaying one or more commits so they appear to branch off
  from a different, usually more current, starting point, producing new
  commit objects with the same content and message as the originals but
  different parents (and therefore different hashes). It exists as an
  alternative to merging for the specific goal of keeping a project's
  history linear — one straight line of commits — rather than showing
  every branch's own divergence and reunion as a visible merge commit.
- **replay** — the actual mechanism rebasing uses: for each commit being
  moved, Git computes that commit's own diff (the same unified diff
  format Lesson 105 already taught in full), then reapplies that
  diff on top of the new base, creating a brand-new commit from the
  result. The term exists because this is closer to "redo this same
  edit somewhere else" than "move this commit" — the original commit
  object, this lesson proves directly, still exists afterward; a new one
  is created alongside it.
- **rewriting history** — any operation, rebasing included, that changes
  which commit object a branch points to via a mechanism other than
  simply adding a new commit on top of the existing chain — specifically,
  one where a commit's own hash changes even though its author, message,
  and content are otherwise unchanged or nearly so. The term exists
  because this is a genuinely different kind of change from everything
  else this domain has taught so far: every other operation (`commit`,
  `merge`) only ever adds new commits; rewriting can make previously
  reachable commits unreachable from any branch.
- **linear history** — a commit history with no merge commits at all —
  every commit has exactly one parent, forming a single, unbroken
  sequence rather than the branching-and-rejoining shape Lesson 109's
  own CS Lens named as a directed acyclic graph with multiple paths.
  Rebasing, used consistently instead of merging, is one common way
  teams achieve this.

**Objects and methods used.**

- **`git rebase`** (this lesson's own subject)
  - *What it is:* the Git subcommand that replays the commits unique to
    the currently checked-out branch onto a new base commit.
  - *Implementation:* `git rebase <branch>`, run while the branch being
    moved is checked out, replays every commit that branch has which the
    target branch doesn't, one at a time, on top of the target branch's
    own current tip. On success, it prints a confirmation naming the
    branch; if a replayed commit's own change can't be applied cleanly
    against the new base — a real conflict — it pauses and reports
    exactly that, a case this lesson's own examples are built to avoid,
    since Lesson 111 covers it directly.
  - *Its use:* this lesson runs it once, moving
    `add-reorder-suggestion`'s single commit from its original base (an
    older `main` commit) onto `main`'s current tip.
- **`git push --force`**
  - *What it is:* the Git subcommand that uploads local commits to a
    remote repository, with the `--force` flag specifically permitting
    it to overwrite the remote's own history even when the local branch
    isn't a simple continuation of it.
  - *Implementation:* `git push --force <remote> <branch>`. An ordinary
    `git push`, without `--force`, refuses outright the moment the local
    and remote histories have diverged — exactly the situation rewriting
    already-pushed history creates; `--force` is the explicit override
    that proceeds anyway.
  - *Its use:* this lesson uses it only in its own closing demonstration,
    to make concrete, provable, and real the specific danger of
    rewriting history that's already been shared — full treatment of
    remotes, pushing, and pulling as this domain's own subject is
    Lesson 112's job, not this one's; this lesson borrows the smallest
    possible slice of it needed to prove a real point.

---

## Concept Unit: Replaying Commits Onto a New Base

### The Problem

`add-reorder-suggestion` was created, per this lesson's own setup, from
an older point in `main`'s history — before `CHANGELOG.md` was added
directly onto `main` afterward. Lesson 109 already showed one way to
bring these back together: merge them, accepting a merge commit with two
parents as the record of how. Is there a way to make
`add-reorder-suggestion`'s own commit look, in the final history, as if
it had been written starting from `main`'s current tip all along —
keeping the project's history as one straight line instead of a
branching-and-rejoining shape?

### Project Change

- **Reference Source.** No reference counterpart — continuing this
  domain's own from-scratch running example.
- **Files affected.** None directly — rebasing changes which commit
  objects exist and which ones a branch points to; no working-directory
  file is edited by hand.
- **Change type.** Configure.
- **Location.** Run from inside `inventory-report/`, with
  `add-reorder-suggestion` checked out.
- **Dependencies.** `add-reorder-suggestion`, holding one commit
  (`reorder_suggestion`, added onto an older point in `main`'s history),
  and `main`, holding one further commit (`CHANGELOG.md`) that branch
  doesn't have.

### The New Code

```bash
git switch add-reorder-suggestion
git rebase main
```

### The Updated Project

No enclosing code structure — a standalone command changing which
commit object `add-reorder-suggestion`'s own ref file points at. The
change is directly visible with `git log --oneline`, run before and
after:

before rebasing, `add-reorder-suggestion`'s history reads:

```text
e9cd910 add reorder_suggestion helper
fc19d84 Merge branch 'add-restock-alert' into main
```

immediately after `git rebase main`, the identical command against the
same branch reads:

```text
b4d07b2 add reorder_suggestion helper
13c0b32 add CHANGELOG
fc19d84 Merge branch 'add-restock-alert' into main
```

The message, `add reorder_suggestion helper`, is unchanged. The hash in
front of it is not — `e9cd910` before, `b4d07b2` after — and the commit
immediately beneath it changed too: `fc19d84` (the merge commit) before,
`13c0b32` (`add CHANGELOG`, `main`'s own newer tip) after. This
lesson's next Concept Unit proves, directly, exactly why the hash had to
change.

### Isolating the Concept: Rebase on the Smallest Possible Divergence

Before trusting this on the real project, prove the underlying mechanism
on the smallest possible throwaway example, continuing directly from the
`lab/` repository's own already-diverged `main` and `experiment` (per
Lesson 109's own second Concept Unit, `main` holds a `README.md` commit
`experiment` doesn't have, and `experiment` holds a `cherry` commit
`main` doesn't have):

```bash
cd lab
git switch experiment
git log --oneline
git rebase main
git log --oneline
```

Before rebasing, `experiment`'s history reads:

```text
<experiment's own commit> add cherry
<main's tip at branch time> add fruits list
```

After `git rebase main`:

```text
<new hash> add cherry
<main's current tip> add README
<main's tip at branch time> add fruits list
```

The `add cherry` commit's own message is identical; its position in the
history and its own hash are not — it now sits directly on top of `add
README`, the commit `main` had gained in the meantime, instead of on top
of the original `add fruits list` commit it was actually written
against. This is called **replaying** a commit, this lesson's own header
term, seen here on the smallest possible example before meeting it on
the real project's own two commits. This `lab/` directory is discarded
now.

### Mechanical Walkthrough

Every distinct element of `git rebase main`'s effect, walked through
against the real project's own values, shown in full in the Run It step
below:

- **`git`** and **`rebase`** — the same single program, and a subcommand
  distinct from every one covered so far in this domain: `merge` creates
  a new commit that *adds* two parents to history; `rebase`, used this
  way, creates new commits that *replace* the checked-out branch's own
  commits, leaving the target branch (`main`) itself completely
  untouched.
- **`main`** — names the new base every commit unique to
  `add-reorder-suggestion` gets replayed on top of — the target of the
  rebase, distinct from the branch actually being moved, which is
  whichever branch is checked out (`add-reorder-suggestion`, not named
  in the command at all, precisely because it's implied by being
  currently checked out).
- **`Successfully rebased and updated refs/heads/add-reorder-suggestion.`**
  — the confirmation Git prints on success, naming exactly which ref
  file it updated — the identical file this domain first opened
  directly in Lesson 108, now updated by `rebase` instead of by `commit`
  or `switch`.

### CS Lens

Rebasing is a real example of **structural sharing versus full
rewriting**: rather than trying to modify the original commit object in
place (Git objects, per Lesson 107's own content-addressable storage
explanation, are never modified in place at all — they're immutable once
created), Git computes a brand-new object from the old one's diff
applied to a new starting point, and simply updates a ref to point at
the new one instead. Also recognized in: a functional programming
language's immutable data structures, where "modifying" a list actually
produces a new list sharing most of its structure with the old one
rather than mutating memory in place; a spreadsheet's "insert row"
operation, which doesn't rewrite the whole sheet, only recomputes
formulas whose relative references shifted; and a compiler's incremental
recompilation, rebuilding only the parts of a program whose own inputs
actually changed rather than the entire codebase from scratch.

### SE Lens

The alternative, per this lesson's own header, is exactly what Lesson
109 already taught: merge instead of rebase, accepting a visible merge
commit as the honest record that two branches diverged and were brought
back together at a specific point. Rebasing's real cost, deferred
deliberately until this Concept Unit's own closing demonstration below,
is severe enough that it needs its own dedicated proof, not just a
sentence here: the moment a commit that's already been shared with
anyone else gets rebased, its old hash — the exact address anyone who
already has a copy is relying on — stops existing on the branch it used
to belong to. Whether to prefer rebasing (a cleaner, linear history) or
merging (an honest, if messier, record of real divergence) is a real,
ongoing tradeoff different teams settle differently — this lesson
teaches both mechanisms accurately rather than declaring one correct.

### Commands Needed

- **`git rebase`** — no separate installation; run while the branch to
  be moved is checked out, naming the new base branch as its argument.

### Run It

From inside the real `inventory-report/` project, on
`add-reorder-suggestion`:

```bash
git rebase main
```

prints:

```text
Successfully rebased and updated refs/heads/add-reorder-suggestion.
```

Confirming the new history:

```bash
git log --oneline
```

prints:

```text
b4d07b2 add reorder_suggestion helper
13c0b32 add CHANGELOG
fc19d84 Merge branch 'add-restock-alert' into main
5ea165c add restock_alert helper
1e98dcc add project README
be4eac2 lower default low-stock threshold from 5 to 3
ab7614a stage inventory_report.py and ignore generated logs
```

One straight line — no branching shown anywhere in this specific
output, even though the project's fuller history (visible with
`--all --graph`) still shows the real, earlier divergences from Lessons
108 and 109, which rebasing this one branch didn't touch or undo.

### Connecting Back

`add-reorder-suggestion` now sits directly on top of `main`'s current
tip. The next Concept Unit answers the question this Concept Unit's own
Updated Project step already raised but didn't fully resolve: exactly
why does the commit's hash have to change, when its message and its own
code change are identical?

---

## Concept Unit: The Same Commit, a Different Address

### The Problem

`add reorder_suggestion helper`, before and after the rebase, has the
identical message and, per the diff it represents, adds the identical
lines of code. Lesson 107 already proved a commit's hash is computed
directly from its own content — so why did rebasing change it at all, if
the content, in the sense of "what code this commit adds," didn't
change?

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** None — read-only inspection of objects the
  previous Concept Unit's own `git rebase` already created.
- **Change type.** N/A.
- **Location.** Run from inside `inventory-report/`.
- **Dependencies.** Both the pre-rebase commit hash, `e9cd910...`, and
  the post-rebase commit hash, `b4d07b2...`, both read from this
  lesson's own first Concept Unit.

### The New Code

```bash
git cat-file -p e9cd9108a7db65ecce3f2278af835182d0fe06b3
git cat-file -p b4d07b2da5a6ca3024659739e97fe45af5b4100c
```

### The Updated Project

No enclosing structure — two direct, side-by-side reads of two real
commit objects, both still present on disk.

### Isolating the Concept: Opening Both Commits at Once

Before comparing the real project's own two objects, prove the smallest
version of the same claim on the throwaway `lab/` repository — reading
`experiment`'s own commit both before and immediately after the previous
Concept Unit's own rebase, using its abbreviated hashes directly from
that Concept Unit's own `git log --oneline` output:

```bash
cd lab
git cat-file -p <experiment's pre-rebase hash>
git cat-file -p <experiment's post-rebase hash>
```

Both print an identical `add cherry` message; the pre-rebase object's
`parent` line names the original `add fruits list` commit; the
post-rebase object's `parent` line names `add README` instead — the new
commit `main` gained while `experiment` was off on its own. This
confirms, directly: the two objects are genuinely different pieces of
data — different `parent` fields — even though a human reading just the
message and the diff would call them "the same change." This `lab/`
directory is now fully discarded, for the final time in this lesson.

### Mechanical Walkthrough

Every distinct element of the real project's own two commit objects,
compared line by line, shown in full in the Run It step below:

- **`tree <hash>`** — different on each: the pre-rebase commit's tree
  represents the project state built from the *old* base (no
  `CHANGELOG.md`); the post-rebase commit's tree represents the project
  state built from the *new* base (`CHANGELOG.md` present) plus the same
  `reorder_suggestion` addition — genuinely different complete project
  snapshots, even though the actual lines this specific commit
  contributes are identical in both.
- **`parent <hash>`** — the single field most directly responsible for
  the changed hash: `fc19d84...` (the old merge commit) before,
  `13c0b32...` (`main`'s new tip, `add CHANGELOG`) after.
- **`author <name> <email> <timestamp>`** — identical in both objects,
  down to the exact same timestamp: rebasing preserves the original
  authoring moment, because the actual work of writing this change
  genuinely happened once, at that time, regardless of where in history
  it later gets replayed.
- **`committer <name> <email> <timestamp>`** — different in both
  objects, even though the name and email match: the committer
  timestamp records when this specific commit *object* was created, and
  the rebase itself created a new one, moments after the original —
  proof, independent of the hash itself, that this really is a distinct
  act of object creation, not a label change on the same underlying
  object.
- **The message** — identical, word for word, in both.

### CS Lens

This is the direct, concrete consequence of **content-addressable
storage**, the exact term Lesson 107 already defined in full: an
object's address is computed from its own content, and a `parent` field
is part of that content, the same as the tree pointer, author, or
message. Change any one of them — even a field with no visible relation
to "what code changed" — and SHA-1, per its own definition already given
in Lesson 107, guarantees a completely different hash, with no partial
or approximate matching possible. This is exactly what makes it
mechanically impossible for Git to "quietly reuse" a commit's old
address after rebasing it onto a new parent — the object genuinely is
different data, whether or not a person would call it "the same
change."

### SE Lens

The alternative — Git somehow preserving a commit's original hash even
after moving it to a new parent — isn't a design choice Git declined; it
isn't possible at all, given content-addressable storage's own core
guarantee, the same guarantee Lesson 107's SE Lens already named as
valuable specifically because it makes tampering or corruption
detectable. The real, load-bearing cost of that same guarantee shows up
directly here: rebasing can never be "free" in the sense of leaving old
addresses valid. Anyone, anywhere, holding a reference to the old hash —
in a saved link, a code review comment, or, most concretely, their own
local clone of this repository — is holding a reference to a commit
that, after this rebase, no longer exists on any branch's own current
history. This is not a hypothetical concern; the next section proves it,
concretely, is a real one.

### Commands Needed

- **`git cat-file -p`** — no separate installation, the same subcommand
  Lesson 107 already introduced in full.

### Run It

From inside the real `inventory-report/` project:

```bash
git cat-file -p e9cd9108a7db65ecce3f2278af835182d0fe06b3
```

prints, the pre-rebase commit, still present on disk even though no
branch currently points at it:

```text
tree e5e7c3d53af20c55d136d31cc3211e451cd1675a
parent fc19d848d73fd409e7dc63e6c65ef474806cb1a4
author Test User <test@example.com> 1786950626 -0400
committer Test User <test@example.com> 1786950626 -0400

add reorder_suggestion helper
```

and:

```bash
git cat-file -p b4d07b2da5a6ca3024659739e97fe45af5b4100c
```

prints the post-rebase commit, the one `add-reorder-suggestion` actually
points at now:

```text
tree 29d30df999e3cffef8b52e51a6ee15a8759a2f5c
parent 13c0b3212a9a8d7e987ad4c8f52da49c6a21e416
author Test User <test@example.com> 1786950626 -0400
committer Test User <test@example.com> 1786950632 -0400

add reorder_suggestion helper
```

Every difference this Concept Unit's own Mechanical Walkthrough
predicted is right there: different `tree`, different `parent`,
identical `author` timestamp, different `committer` timestamp, identical
message. Two genuinely different objects, addressed by two genuinely
different hashes, both real, both currently readable — one simply no
longer reachable from any branch.

### Connecting Back

The Problem step's own question is answered with direct proof, not
assertion: the commit's hash changed because its content — specifically
its `parent` field — genuinely changed, exactly as content-addressable
storage, per Lesson 107, guarantees it must. The old commit object,
`e9cd910...`, still physically exists inside `.git/objects/` at this
exact moment — it simply has no branch, tag, or other reference pointing
at it anymore, which is exactly the situation this lesson's own closing
demonstration turns into a real, concrete failure.

---

## Connect the Pieces

Both Concept Units trace one continuous fact from two different angles.
`git rebase main`, run against `add-reorder-suggestion`, changed that
branch's own history to read as one straight line, sitting directly on
top of `main`'s current tip instead of the older point it actually
diverged from — confirmed first by `git log --oneline` showing a
different hash, `b4d07b2` instead of `e9cd910`, in front of the
identical message. The second Concept Unit then opened both objects
directly, with the identical `git cat-file -p` proof Lesson 107 first
established, and found exactly why: a different `parent` field, a
different `tree`, an identical `author` timestamp proving the same
original authorship, and a different `committer` timestamp proving a
genuinely new object was created moments after the original. Nothing
about `add-reorder-suggestion`'s actual code changed across this whole
lesson — only where, in the project's history, that code now appears to
have been written from. And because `main`'s own tip is now exactly what
`add-reorder-suggestion`'s own new parent points at, merging the two
from here forward, per Lesson 109's own first Concept Unit, would now be
a plain fast-forward — the rebase didn't just make the history linear;
it made the eventual merge trivial too.

## What Breaks Without This

Cause the real failure this lesson's own SE Lens named but didn't yet
prove: rebasing a commit that's already been shared. Set up the smallest
possible real demonstration — a bare repository standing in for a shared
remote, and a second clone standing in for a second engineer's own
machine, both concepts this domain gives their own full treatment to in
Lesson 112, borrowed here only far enough to prove this one point:

```bash
git init --bare /path/to/origin.git
git remote add origin /path/to/origin.git
git push origin main
```

Now, from a separate clone of that same remote — standing in for a
second engineer, already caught up with everything just pushed —
rewrite a commit that clone already has, using the smallest possible
history-rewriting operation, `git commit --amend`, on the original
repository:

```bash
git commit --amend -m "add reorder_suggestion helper for restocking"
git push --force origin main
```

`git push`, without `--force`, would have refused outright here — a
real, deliberate safeguard this domain hasn't needed to demonstrate
until now, since nothing before this lesson ever produced diverged
histories on the *same* branch name between two separate clones.
`--force` overrides that safeguard, exactly as this lesson's own header
described it. Now, from the second clone — the "other engineer,"
completely unaware any of this happened — an entirely ordinary command:

```bash
git pull
```

prints:

```text
 + b4d07b2...ed55e81 main       -> origin/main  (forced update)
Merge made by the 'ort' strategy.
```

and `git log --oneline --all --graph --decorate`, run immediately
afterward in that second clone, shows the real mess this whole
demonstration exists to prove is real, not hypothetical:

```text
*   0884d30 (HEAD -> main) Merge branch 'main' of /path/to/origin
|\
| * ed55e81 (origin/main, origin/HEAD) add reorder_suggestion helper for restocking
* | b4d07b2 add reorder_suggestion helper
|/
* 13c0b32 add CHANGELOG
```

**Two commits, not one**, both claiming to add the identical
`reorder_suggestion` function — `b4d07b2`, the second engineer's own
original copy, and `ed55e81`, the rewritten version that arrived from
the force-push — joined by an entirely unnecessary merge commit neither
engineer asked for or expected. Nothing about this is a corrupted
repository or a bug; every command involved worked exactly as
documented. It's the direct, provable, real-world consequence of
rewriting a commit's address after someone else already has a copy of
the old one: Git has no way to know `b4d07b2` and `ed55e81` are "the
same change" — per this lesson's own second Concept Unit, they are
provably different objects — so it does the only honest thing it can:
treats them as two separate, unrelated commits and merges both in. This
demonstration's own `origin.git` and second clone are discarded now,
existing only to make this one danger concrete; the real
`inventory-report/` project's own history, from this point in the
lesson forward, is exactly what the two Concept Units above left it as.

## Exercises

1. On a throwaway repository, create a branch, add two commits to it,
   then rebase it onto a `main` that has gained one commit in the
   meantime. Using `git cat-file -p`, confirm both of the rebased
   branch's commits now have different hashes than they did before —
   not just the first one.
2. Reproduce this lesson's own "What Breaks Without This" demonstration
   yourself, using a bare repository and a second clone. After the
   forced pull produces the duplicate-commit mess, state in your own
   words what a real engineer, seeing this in their own project, would
   need to do next — and why simply rebasing or merging again wouldn't,
   on its own, remove the confusion of two commits both claiming to add
   the same change.
3. Using the real `inventory-report/` project's own history, run `git
   cat-file -p` against `e9cd9108a7db65ecce3f2278af835182d0fe06b3` — the
   original, pre-rebase commit from this lesson's own first Concept
   Unit — and confirm it's still readable. Then explain, in one
   sentence, why this object being still-present-but-unreachable is
   different from it being deleted.

## Definition of Done

- [ ] `add-reorder-suggestion` has been rebased onto `main`, confirmed
      by `git log --oneline` showing a linear history with no merge
      commit for this specific branch's own history.
- [ ] Both the pre-rebase and post-rebase commit objects have been
      opened directly with `git cat-file -p`, and the specific fields
      that differ (`tree`, `parent`, `committer` timestamp) and the
      fields that don't (`author` timestamp, message) have both been
      identified.
- [ ] The shared-history danger has been reproduced for real, using a
      bare repository and a second clone, ending in the exact
      duplicate-commit graph this lesson's own closing section showed.
- [ ] You can state, without looking anything up, the one-sentence rule
      this entire lesson builds toward: never rebase a commit that's
      already been shared with anyone else.

Merge the now-fast-forwardable `add-reorder-suggestion` into `main`,
proving this lesson's own closing connection to Lesson 109 directly:

```bash
git switch main
git merge add-reorder-suggestion
git commit -m "confirm rebase produces new commit hashes and enables a clean fast-forward"
```
