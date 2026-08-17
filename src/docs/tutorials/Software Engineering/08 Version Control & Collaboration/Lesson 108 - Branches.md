# Lesson 108: Branches

**What you will build.** A second line of development inside
`inventory-report/` — a real branch, `lower-default-threshold`, created
alongside `main`, switched to, committed on independently, and then
proven, by directly reading the real files Git stores on disk, to be
nothing more exotic than a movable pointer to a single commit hash. This
lesson also finally explains `main` itself — the word every `git status`
and `git log` output in this domain has shown since Lesson 105, flagged
each time as not yet explained. The transferable problem this lesson is
actually about: two genuinely different pieces of work — lowering a
default threshold, and, in this domain's own running two-engineer
example, fixing a case-sensitivity bug versus adding on-call logging —
need to exist, developed and committed independently, without either one
touching the other's code or the project's own stable, working version,
until someone deliberately decides to bring them together.

**What you need to know first.** Lesson 107 (Commits) directly — this
lesson depends completely on that lesson's own real, verified proof that
a commit is an ordinary object addressed by a hash, and specifically on
its own explanation of `parent commit`: a branch, as this lesson shows,
is nothing more than a name pointing at one specific commit hash, which
is only a meaningful idea once "a specific commit hash" is itself
understood as something real and inspectable, exactly as Lesson 107
proved with `git cat-file`. This lesson also finally fulfills the
forward-reference Lesson 106 and Lesson 107 both flagged: what `main`
actually is, and why one already existed before this lesson deliberately
created a second one.

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

Still **Implementation** and **Integration**. This lesson gives the
two-engineer example from Lessons 105–107 the concrete tool its own
scenario has been implicitly missing: Engineer A, fixing
`is_username_available`'s case-sensitivity gap, and Engineer B, adding
on-call logging, can now each create their own branch off the same
shared `main` — `fix/username-case-sensitivity` and
`feature/oncall-logging`, say — commit their own work there,
independently, as many times as needed, without either one's
in-progress work ever touching `main` or each other's branch. This is
still **Implementation**, not yet **Integration** — two branches
existing side by side, even inside the same shared repository, changes
nothing about whether their content has actually been combined. That's
still Lesson 109's own subject, Merging. What branches add, concretely,
is a place for each engineer's own in-progress `Implementation` work to
live, safely separated, while it's still incomplete or unproven —
exactly the gap this lesson's own Concept Units close.

**Terms used in this lesson.**

- **branch** — a name pointing at one specific commit, movable to a
  different commit each time a new commit is made while that branch is
  checked out. It exists so more than one line of development can
  proceed at once inside the same repository, each one tracked
  independently, without any of them needing their own separate copy of
  the entire project's history.
- **`HEAD`** — a special reference tracking which branch (or,
  occasionally, which specific commit) is currently checked out — in
  other words, which one the working directory currently reflects and
  which one a new commit would become the latest commit of. It exists
  because a repository can contain many branches at once, and something
  has to record, at any given moment, which one you're actually looking
  at and working on.
- **checked out** — the state of being the branch (or commit) `HEAD`
  currently points to, and therefore the one whose content the working
  directory currently shows. A repository can contain any number of
  branches, but only ever has exactly one checked out at a time.
- **default branch** — the branch a repository starts with automatically,
  the moment `git init` creates it, before anyone deliberately creates a
  second one. Modern Git (the version this domain uses throughout) names
  it `main` by default; this term exists because that starting branch
  isn't created by any command this domain has taught so far — `git
  init` alone creates it, a fact this lesson proves directly.
- **diverge** — what two branches do the moment they point at two
  different commits after having, at some earlier point, pointed at the
  same one. The term exists to describe exactly the moment this lesson's
  own Concept Units create: `main` and `lower-default-threshold`,
  identical immediately after being created, no longer identical the
  instant a commit is made on only one of them.
- **fast-forward** — a specific, simple case of moving a branch pointer
  forward along a chain of commits that already includes its own current
  position, with no combining of separate history required. Flagged
  here, not explained in full yet: exactly what makes a branch update a
  fast-forward versus something more involved is Lesson 109's own
  subject, Merging — this lesson only creates the diverged history that
  makes the distinction meaningful in the first place.

**Objects and methods used.**

- **`git branch`** (this lesson's own subject, in its creating form)
  - *What it is:* the Git subcommand that creates, lists, or deletes
    branches, depending on the arguments given.
  - *Implementation:* `git branch <name>`, with a name and no other
    flags, creates a new branch pointing at whatever commit `HEAD`
    currently points at, without switching to it. `git branch`, with no
    arguments at all, lists every branch that exists in the repository,
    marking the currently checked-out one with a leading `*`.
  - *Its use:* this lesson runs the creating form once, to start
    `lower-default-threshold` pointing at the same commit `main` already
    pointed at, and the listing form repeatedly, to confirm the
    repository's own branch state at each step.
- **`git switch`**
  - *What it is:* the Git subcommand that changes which branch is
    currently checked out, updating both `HEAD` and the working
    directory to match.
  - *Implementation:* `git switch <branch-name>`. On success it prints a
    one-line confirmation (`Switched to branch '<name>'`) and rewrites
    every file in the working directory that differs between the
    previously checked-out commit and the newly checked-out one — this
    lesson's own third Concept Unit shows that rewrite happening for
    real, on `inventory_report.py` itself. (`git checkout <branch-name>`
    is an older, still valid and still extremely common spelling of the
    identical operation; this domain uses `git switch` throughout
    because its name states plainly what it does, where `checkout` is
    also, confusingly, the name of a separate operation for restoring
    individual files — not used or needed anywhere in this domain.)
  - *Its use:* this lesson uses it to move from `main` to
    `lower-default-threshold` and confirm the working directory actually
    changes as a direct result.

---

## Concept Unit: Creating a Branch

### The Problem

`inventory-report/` currently has exactly one commit, on exactly one
branch, `main` — a name this project has shown in every `git status` and
`git log` output since Lesson 105, never yet explained. Say you now want
to try lowering `low_stock_items`'s default threshold from 5 to 3,
without committing that change directly onto `main` — maybe it needs
review first, maybe you're not sure it's right yet. Nothing about `git
commit`, as Lesson 107 explained it in full, offers any way to make a
commit that *isn't* added to whichever branch is currently checked out.
Some other mechanism is needed — one that lets a new line of commits
exist without disturbing `main`'s own history at all.

### Project Change

- **Reference Source.** No reference counterpart — continuing this
  domain's own from-scratch running example.
- **Files affected.** None — creating a branch changes Git's own
  internal bookkeeping, not any project file.
- **Change type.** Add — a new branch, a new pointer, inside the
  existing repository.
- **Location.** Run from inside `inventory-report/`, currently on `main`.
- **Dependencies.** The commit made in Lesson 107, currently the only
  commit in the repository.

### The New Code

```bash
git branch lower-default-threshold
```

### The Updated Project

No enclosing code structure — a standalone command changing Git's
internal state. What changes is directly visible by listing branches
immediately afterward:

```bash
git branch
```

prints:

```text
  lower-default-threshold
* main
```

Two branches now exist where one did before; the `*` marks `main` as
still the one currently checked out — creating a branch, on its own,
does not switch to it.

### Isolating the Concept: A Branch Immediately After Creation

Before trusting what this did to the real project, prove the specific
claim the Problem step implied — that a new branch starts out identical
to the one it was created from — on the smallest possible throwaway
example:

```bash
mkdir lab && cd lab
git init -q
git config user.name "Test User"
git config user.email "test@example.com"
printf 'apple\nbanana\n' > fruits.txt
git add fruits.txt
git commit -q -m "add fruits list"
git branch experiment
git log --oneline --all
```

prints:

```text
a1b2c3d (HEAD -> main, experiment) add fruits list
```

One commit, but two branch names — `main` and `experiment` — both
listed next to it. This confirms: creating a branch does not create a
new commit, does not copy any files, and does not change what's checked
out; it only adds a second name pointing at the exact same commit the
first name already pointed at. This `lab/` directory is discarded now.

### Mechanical Walkthrough

Every distinct element of `git branch lower-default-threshold`, walked
through against the real project:

- **`git`** and **`branch`** — the same single program, and a
  subcommand distinct from every one covered so far: `commit` creates a
  new commit and moves the current branch to point at it; `branch`, used
  this way, creates a new *name* pointing at whatever commit is already
  checked out, with no new commit involved at all.
- **`lower-default-threshold`** — the new branch's name, chosen here to
  describe the specific change it's meant to hold, following the same
  convention this curriculum's own Engineering Conventions lesson
  (Lesson 104) already named in full: a consistent, deliberate,
  descriptive choice, not an arbitrary label.
- **`git branch`'s own listing output** — `main`, still marked `*`
  (currently checked out); `lower-default-threshold`, listed without a
  `*` (exists, but not checked out).

### CS Lens

A branch is a real example of an **alias**: a second name referring to
the exact same underlying value — here, the same commit hash — rather
than a second copy of it. Also recognized in: a symbolic link on a
filesystem, pointing at the same file another path already names,
without duplicating its content; a database view built from an existing
table, computed on demand rather than stored separately; and, in most
programming languages, assigning one variable to another
(`b = a`) when both then refer to the identical underlying object rather
than two independent copies.

### SE Lens

The alternative to a branch — the only one available before this lesson
— is exactly the situation the Problem step described: commit
everything directly onto `main`, whether it's finished, reviewed, or
even correct yet. That alternative's real cost is that `main`'s own
history stops being a reliable record of finished, working states; it
becomes a mix of finished work and whatever was mid-experiment at the
time. Branching removes that cost by giving incomplete work its own
separate place to exist — a real, standing convention this whole domain,
and most real software teams, build around: `main` stays deployable at
all times, and everything uncertain lives on its own branch until it's
ready. The real cost branching doesn't remove: a project with many
branches has, by definition, many diverging histories to eventually
reconcile — a cost this lesson's own final Concept Unit creates directly,
and Lesson 109 exists specifically to resolve.

### Commands Needed

- **`git branch`** — no separate installation; available the moment
  `git` is. Requires at least one existing commit to point the new
  branch at — running it in a repository with zero commits produces an
  error, since there's nothing yet for a new branch to point to.

### Run It

From inside the real `inventory-report/` project:

```bash
git branch lower-default-threshold
git branch
```

prints:

```text
  lower-default-threshold
* main
```

exactly matching the isolated lab's own two-branches-one-commit result,
confirmed here on the real project.

### Connecting Back

Two branches now exist, both pointing at the same commit, `main` still
checked out. The next Concept Unit stops describing what a branch is in
prose and opens the real files Git uses to implement one — the same
demystification standard Lesson 107 already held commits to.

---

## Concept Unit: What `main` and `HEAD` Actually Are

### The Problem

Every explanation so far — "a branch is a name pointing at a commit,"
"`HEAD` tracks which branch is checked out" — has been prose. Lesson 107
already proved, with `git cat-file`, that a commit is real, inspectable
data, not an assertion to take on faith. The identical standard applies
here: is a branch actually a real, separate piece of data stored
somewhere on disk, or is "branch" just a name for some internal Git
behavior with no concrete, inspectable form at all?

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** None — reading files Git already created,
  automatically, back when `git init` and `git branch` ran.
- **Change type.** N/A — read-only inspection.
- **Location.** Inside `inventory-report/.git/refs/heads/` and
  `inventory-report/.git/HEAD` directly.
- **Dependencies.** The two branches, `main` and
  `lower-default-threshold`, created so far.

### The New Code

```bash
cat .git/refs/heads/main
cat .git/refs/heads/lower-default-threshold
cat .git/HEAD
```

### The Updated Project

No enclosing structure — three direct reads of real files already
sitting inside the `.git` directory Lesson 105 first created and
`git init` first populated.

### Isolating the Concept: Two Ref Files, One Hash

Before reading the real project's own ref files, look at the throwaway
lab's own — `main` and `experiment`, both still pointing at the same
commit, from the previous Concept Unit's own isolated example:

```bash
cd lab
cat .git/refs/heads/main
cat .git/refs/heads/experiment
```

prints, identically for both:

```text
a1b2c3d4e5f60718293a4b5c6d7e8f9012345678
```

The exact same 40-character hash, in two separate files, one per
branch name — direct, concrete proof that a branch really is nothing
more than a name (the filename itself) attached to a commit hash (the
file's own one-line content). This `lab/` directory is discarded now.

### Mechanical Walkthrough

Every distinct element of what these three real files actually contain,
walked through against the real project's own values shown in the Run It
step below:

- **`.git/refs/heads/main`** — a plain text file, one line, containing
  exactly one commit hash: the commit `main` currently points at. The
  file's own name, `main`, inside the `refs/heads/` directory, *is* the
  branch name — there is no separate "branch record" anywhere else;
  the file's existence, its location, and its one-line content are the
  entire branch.
- **`.git/refs/heads/lower-default-threshold`** — the identical kind of
  file, a different filename, currently holding the identical hash `main`
  holds — direct proof of what the previous Concept Unit already stated
  in prose: a newly created branch starts out pointing at the exact same
  commit as the branch it was created from.
- **`.git/HEAD`** — a different kind of file from the two above: instead
  of a commit hash directly, it contains the text `ref: refs/heads/main`
  — a pointer to a *ref file*, not to a commit directly. This is called a
  **symbolic reference**: `HEAD` doesn't say "the current commit is
  `ab7614a...`" directly; it says "look at whatever
  `refs/heads/main` currently contains," which is exactly why switching
  branches (this lesson's next Concept Unit) only ever has to rewrite
  this one small file, not recompute anything about the commit itself.

### CS Lens

`HEAD`'s own structure — a pointer to a pointer, rather than a direct
pointer to the actual data — is a real, named pattern: **indirection**.
Also recognized in: a phone contact list entry that stores a phone
number, which itself routes through a carrier's own switching system
rather than connecting to a fixed physical wire; a URL shortener, which
stores a short link that redirects to the real, full address rather than
storing the destination page directly; a programming language's own
pointer-to-a-pointer construct, used specifically when the thing being
pointed at might itself need to change; and a company's org chart
listing a role ("Engineering Manager") rather than a specific person's
name, so the chart doesn't need editing every time someone changes jobs.

### SE Lens

The alternative — `HEAD` storing a commit hash directly, rather than a
reference to a branch's own ref file — would mean every single commit
made would require updating `HEAD` itself with a new hash, and, more
importantly, would give up the one property this indirection specifically
buys: multiple things can point at the same target, and updating the
target moves everything that points at it, automatically, with no need
to update each pointer separately. This is exactly what makes switching
branches (the next Concept Unit) cheap: moving `HEAD` from pointing at
`refs/heads/main` to pointing at `refs/heads/lower-default-threshold`
touches exactly one small file, regardless of how large the actual
project or how long its history is. The real cost of this indirection:
one more concept, `HEAD`, and one more level a person has to mentally
trace through — worth it, per this Concept Unit's own CS Lens, for the
same reason every other real use of indirection is worth it, but not
free.

### Commands Needed

None beyond reading a plain text file — no new program, no
installation.

### Run It

From inside the real `inventory-report/` project:

```bash
cat .git/refs/heads/main
cat .git/refs/heads/lower-default-threshold
cat .git/HEAD
```

prints:

```text
ab7614a98b9d2fd58564c1dd354d3a5c5cddd736
ab7614a98b9d2fd58564c1dd354d3a5c5cddd736
ref: refs/heads/main
```

The exact same hash, `ab7614a98b9d2fd58564c1dd354d3a5c5cddd736`, in both
ref files — the same hash Lesson 107's own `git log` and `git cat-file`
output already showed, now confirmed sitting, in full, inside two
separate one-line files. `HEAD` names `main` specifically, confirming
`main` — not `lower-default-threshold` — is still the branch actually
checked out.

### Connecting Back

Two branches, two files, one shared hash, and a third file, `HEAD`,
naming which of the two is actually active right now. Nothing about any
of this has changed the working directory yet — `inventory_report.py`
still reads `threshold=5`, the same content it's held since Lesson 106.
The next Concept Unit changes that, deliberately, by switching to the
other branch.

---

## Concept Unit: Switching Branches

### The Problem

Both branches exist, both point at the same commit, and `main` is still
checked out. Making a change intended for `lower-default-threshold`
right now would still land on `main` — `git commit`, per Lesson 107,
always commits onto whichever branch `HEAD` currently names, regardless
of which branch that change was conceptually meant for. Something has to
actually move `HEAD` first.

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** `.git/HEAD`, rewritten by Git itself, not edited
  directly.
- **Change type.** Configure.
- **Location.** Run from inside `inventory-report/`.
- **Dependencies.** The `lower-default-threshold` branch created in this
  lesson's first Concept Unit.

### The New Code

```bash
git switch lower-default-threshold
```

### The Updated Project

`.git/HEAD`'s own content, read directly again immediately after this
command, shows the actual change:

```text
ref: refs/heads/lower-default-threshold
```

replacing the `ref: refs/heads/main` this lesson's previous Concept Unit
showed. Everything else about the two ref files themselves —
`refs/heads/main` and `refs/heads/lower-default-threshold` — is
untouched; only which one `HEAD` names has changed.

### Isolating the Concept: A Switch That Changes What's on Disk

Before checking the real project, prove the specific, easy-to-doubt
claim this whole Concept Unit exists to demonstrate — that switching
branches doesn't just change some internal bookkeeping value, it
actually rewrites files in the working directory — on the throwaway
`lab/` repository, first adding a second commit to `experiment` so the
two branches genuinely differ:

```bash
cd lab
git switch experiment
printf 'apple\nblueberry\n' > fruits.txt
git add fruits.txt
git commit -q -m "swap banana for blueberry"
git switch main
cat fruits.txt
git switch experiment
cat fruits.txt
```

Switched to `main`, `fruits.txt` reads:

```text
apple
banana
```

the original content, from before `experiment` ever existed. Switched
back to `experiment`, the same file reads:

```text
apple
blueberry
```

The identical filename, on the identical path, with genuinely different
content, purely as a result of which branch is checked out — direct,
concrete proof that `git switch` doesn't just update an internal
pointer; it actively rewrites the working directory to match whatever
commit the newly checked-out branch's ref file names. This `lab/`
directory is discarded now.

### Mechanical Walkthrough

Every distinct element of `git switch lower-default-threshold` and its
effect, walked through against the real project's own run in the Run It
step below:

- **`git`** and **`switch`** — the same program, and a subcommand
  distinct from every one covered so far: unlike `branch` (creates a
  name), `commit` (creates a new commit), or `cat .git/HEAD` (only
  reads), `switch` both rewrites `.git/HEAD`'s content and rewrites
  whichever files in the working directory differ between the old and
  new checked-out commits.
- **`lower-default-threshold`** — the target branch name; `git switch`
  looks this name up as a file inside `refs/heads/`, exactly the file
  this lesson's previous Concept Unit already opened directly, reads the
  hash it contains, and checks out the commit that hash addresses.
- **`Switched to branch 'lower-default-threshold'`** — the one-line
  success confirmation, printed once the working directory has already
  been rewritten and `.git/HEAD` already updated.

### CS Lens

Rewriting the working directory to exactly match one specific commit,
purely by following a chain of pointers (branch name → commit hash →
tree hash → blob hashes, the exact chain Lesson 107's own `git cat-file`
walkthrough already traced by hand) is the same operation, conceptually,
as **restoring a snapshot** in any versioned storage system. Also
recognized in: a virtual machine reverting to a saved snapshot, a
database restoring from a point-in-time backup, and a video game loading
a saved game state — in every case, the current state is discarded (or,
here, safely preserved on the previous branch, not discarded at all) and
replaced wholesale by a previously recorded one, addressed by some
identifier rather than reconstructed step by step.

### SE Lens

The alternative to a dedicated `switch` command would be manually
copying files between two separate project folders, one per line of
development — genuinely how some people worked before real version
control existed, and exactly the same accidental complexity this domain
opened, in Lesson 105, by rejecting manual copies entirely. `git
switch`'s real cost, worth stating honestly: it can fail. This lesson's
own "What Breaks Without This" section demonstrates the specific,
common way — uncommitted changes that would be silently overwritten by
the switch — and the real reason Git refuses in that case rather than
proceeding anyway.

### Commands Needed

- **`git switch`** — no separate installation; requires the target
  branch to already exist (created here via `git branch` in this
  lesson's first Concept Unit).

### Run It

From inside the real `inventory-report/` project, currently on `main`:

```bash
git switch lower-default-threshold
cat .git/HEAD
```

prints:

```text
Switched to branch 'lower-default-threshold'
ref: refs/heads/lower-default-threshold
```

`inventory_report.py`'s own content, at this exact point, is still
identical on both branches — no commit has yet been made on
`lower-default-threshold` to make it differ — confirmed directly:

```bash
cat inventory_report.py
```

prints:

```text
def low_stock_items(inventory, threshold=5):
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)
```

still `threshold=5`, exactly as committed in Lesson 107 — switching
branches changed which branch is checked out; it hasn't yet changed
which commit that branch points at.

### Connecting Back

`HEAD` now names `lower-default-threshold`. The working directory,
confirmed directly above, still matches the one shared commit both
branches point at. The final Concept Unit finally makes a commit on this
branch specifically — the one act that will make `main` and
`lower-default-threshold` genuinely diverge for the first time.

---

## Concept Unit: Diverging History

### The Problem

Both branches still point at the identical commit. Nothing about this
lesson so far has actually created two different lines of development —
only the scaffolding for one. Making the actual change this branch
exists for — lowering the default threshold from 5 to 3 — and
committing it, only on this branch, is the one remaining step that turns
"two names for the same thing" into "two genuinely different histories."

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** `inventory_report.py`, modified in place.
- **Change type.** Modify — one parameter default.
- **Location.** Inside `low_stock_items`'s own function signature, in
  `inventory_report.py`.
- **Dependencies.** `lower-default-threshold` currently checked out, per
  the previous Concept Unit.

### The New Code

```python
def low_stock_items(inventory, threshold=3):
```

### The Updated Project

Placed inside the function it belongs to, with the changed line marked:

```python
def low_stock_items(inventory, threshold=3):  # ← changed from `threshold=5`
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)
```

The function's behavior changes as a whole: it now flags an item as low
stock only once its count drops below 3, rather than below 5 — a
narrower, later warning than the version still committed on `main`.

### Isolating the Concept: A Real Divergence, Visualized

Continue the throwaway `lab/` repository, already holding two branches
with genuinely different content per the previous Concept Unit's own
isolated lab, and visualize the divergence directly:

```bash
cd lab
git log --oneline --all --graph --decorate
```

prints:

```text
* a3b4c5d (HEAD -> experiment) swap banana for blueberry
* a1b2c3d (main) add fruits list
```

Both commits shown, one per line, each labeled with exactly which
branch (or branches) point at it. `main` still names the older commit;
`experiment` names the newer one, which itself points back at the older
one as its own parent — the exact `parent` field Lesson 107's own
`git cat-file` walkthrough already proved exists inside every non-root
commit object. This is called **diverging history**, this lesson's own
header term, now seen directly rather than only described. This `lab/`
directory is discarded now, for the final time in this lesson.

### Mechanical Walkthrough

Every distinct element of the equivalent real command against
`inventory-report/`, shown in the Run It step below:

- **`git log --oneline --all --graph --decorate`** — four flags on the
  same `git log` subcommand Lesson 107 already introduced: `--oneline`
  (one line per commit, already explained in Lesson 107), `--all` (show
  every branch's history, not just the currently checked-out one's —
  without it, `git log` alone would show only commits reachable from
  `HEAD`, hiding `main`'s own separate history entirely once the two
  diverge), `--graph` (draw the actual branching structure using `*` and
  line characters), and `--decorate` (label each commit with which
  branch names currently point at it — without this flag, the graph
  would show the same shape but no branch names at all, leaving a reader
  unable to tell which line is which).
- **The `*` characters and connecting lines** — ASCII-art representing
  the actual shape of the commit graph: two separate `*` marks, one line
  connecting `main`'s commit up to the shared root, a second line
  connecting `lower-default-threshold`'s newer commit up through that
  same shared root — the same parent-pointer chain Lesson 107 already
  proved is real, rendered visually here instead of read one
  `git cat-file` call at a time.

### CS Lens

A commit history that branches and remains connected through shared
ancestors, rather than splitting into two completely separate,
unconnected sequences, is a **directed acyclic graph** (DAG): a set of
nodes connected by one-directional edges (each commit points to its
parent, never the other way), with no cycles (a commit can never,
directly or indirectly, be its own ancestor). This is a stronger, more
precise claim than "linked list," the structure Lesson 107's own CS Lens
already named for a single branch's own straight-line history — a
linked list is a DAG with exactly one path through it; the moment a
second branch diverges from a shared ancestor, the structure becomes a
DAG with more than one path, still connected, never cyclic. Also
recognized in: a family tree once more than one child is shown (each
child has exactly one set of parents, but a shared ancestor can have
many descendant lines), a build system's own dependency graph (a task
can depend on several others, and several tasks can share one common
dependency, but nothing can depend on itself, even indirectly), and a
citation graph between academic papers.

### SE Lens

The alternative — a version control system that could only ever
maintain one single, straight-line history, with no branching at all —
would force every single piece of unfinished or uncertain work directly
onto the one and only history, exactly the cost this lesson's first
Concept Unit already named. Branching's own real cost is what this
Concept Unit's own diagram makes newly visible: a project with more than
one active branch has more than one "current" state, and someone,
eventually, has to decide how — or whether — those states get combined.
That decision, and the mechanism for making it, is Lesson 109's own
entire subject.

### Commands Needed

- **`git log --oneline --all --graph --decorate`** — no separate
  installation; every flag is a standard part of `git log` itself.

### Run It

From inside the real `inventory-report/` project, with the threshold
change committed on `lower-default-threshold`:

```bash
git commit -am "lower default low-stock threshold from 5 to 3"
git log --oneline --all --graph --decorate
```

prints:

```text
[lower-default-threshold be4eac2] lower default low-stock threshold from 5 to 3
 1 file changed, 1 insertion(+), 1 deletion(-)
* be4eac2 (HEAD -> lower-default-threshold) lower default low-stock threshold from 5 to 3
* ab7614a (main) stage inventory_report.py and ignore generated logs
```

`main` still names `ab7614a` — completely untouched — while
`lower-default-threshold` now names a new commit, `be4eac2`, whose own
parent (per Lesson 107's own explanation of what a commit object
contains) is `ab7614a` itself. Confirm the two branches genuinely hold
different working-directory content, exactly as the isolated lab already
proved:

```bash
git switch main
cat inventory_report.py
```

prints `threshold=5`; switching back:

```bash
git switch lower-default-threshold
cat inventory_report.py
```

prints `threshold=3` — the identical file, the identical path, two
different real contents, purely as a function of which branch is
checked out.

### Connecting Back

`main` and `lower-default-threshold` now genuinely diverge: one commit
each holds that the other doesn't. Both are real, both are permanent
(per Lesson 107), and both currently exist only inside this one
repository, on this one machine. Nothing so far has combined them, or
needed to — that's exactly where this domain goes next.

---

## Connect the Pieces

One thread runs through all four Concept Units. `git branch
lower-default-threshold` created a second name pointing at the exact
same commit `main` already named — proven not by trusting the command's
own confirmation, but by opening `.git/refs/heads/main` and
`.git/refs/heads/lower-default-threshold` directly and finding the
identical 40-character hash inside both. `.git/HEAD`'s own content, `ref:
refs/heads/main`, proved which of the two was actually active, through
one more level of indirection rather than a hash directly. `git switch
lower-default-threshold` rewrote that one small file, and, directly
proven against the throwaway lab first, rewrote real working-directory
content to match — the same file, `fruits.txt` there, `inventory_report.py`
here, showing genuinely different content purely as a function of which
branch's ref file `HEAD` currently names. And the final commit, made
only after switching, gave `lower-default-threshold` its own new commit,
its own new hash, and its own parent pointer back to the one commit both
branches still share — turning "two names for one thing" into two
genuinely different histories, visualized directly with `--graph
--decorate`, both still real, both still permanent, and both still
sitting only in this one local repository.

## What Breaks Without This

Cause the real failure `git switch` exists to prevent, on purpose: an
uncommitted change that would be silently lost by switching branches.
From inside the real `inventory-report/` project, on `main`, make an
edit and do not commit it:

```bash
git switch main
sed -i 's/threshold=5/threshold=4/' inventory_report.py
git switch lower-default-threshold
```

prints:

```text
error: Your local changes to the following files would be overwritten by checkout:
	inventory_report.py
Please commit your changes or stash them before you switch branches.
Aborting
```

and exits with status `1` — a real, reported refusal, not silence and
not a silent overwrite. This is exactly the failure this Concept Unit's
own "working directory gets rewritten" explanation predicted: switching
branches means replacing `inventory_report.py`'s content with whatever
the target branch's own commit holds, and Git refuses to do that the
moment it would destroy a real, uncommitted edit with no way to recover
it afterward. The error message names two ways forward — committing the
change first, or a separate command, `git stash`, that temporarily sets
aside uncommitted changes without committing them, a tool this domain
doesn't cover further since either committing or discarding the change
resolves this exact scenario. Discard the experimental edit and confirm
the switch now succeeds cleanly:

```bash
git checkout -- inventory_report.py
git switch lower-default-threshold
```

prints:

```text
Switched to branch 'lower-default-threshold'
```

restoring exactly the working, switchable state every earlier Concept
Unit in this lesson demonstrated.

## Exercises

1. Create a third branch from `main` in the real `inventory-report/`
   project, make one small, different change on it, and commit it. Run
   `git log --oneline --all --graph --decorate` and, without looking
   anything up, describe in your own words what the resulting graph
   shape means — specifically, how many branches now share `main`'s own
   original commit as a common ancestor.
2. On any branch with at least one commit, run `cat .git/refs/heads/
   <branch-name>` before and after making a new commit on that branch.
   State exactly what changed inside that one file, and confirm it
   matches the new commit's own abbreviated hash from `git log
   --oneline`.
3. Reproduce this lesson's own "What Breaks Without This" scenario, but
   resolve it the other way: instead of discarding the uncommitted
   change, commit it first, then switch branches successfully. Confirm,
   with `git log --oneline --all --graph --decorate`, that this creates
   a third commit, on `main`, separate from `lower-default-threshold`'s
   own single commit.

## Definition of Done

- [ ] `inventory-report/` has two branches, `main` and
      `lower-default-threshold`, confirmed by `git branch`.
- [ ] `.git/refs/heads/main` and `.git/refs/heads/lower-default-threshold`
      have been opened directly and shown to hold different hashes,
      after the divergence in this lesson's final Concept Unit.
- [ ] `.git/HEAD` has been read directly, both before and after a `git
      switch`, showing its own content change to match.
- [ ] Switching branches has been shown to change real
      working-directory file content, not just an internal pointer,
      confirmed by reading `inventory_report.py` on both branches.
- [ ] The uncommitted-changes-blocking-a-switch failure has been
      reproduced on purpose and resolved.
- [ ] `git log --oneline --all --graph --decorate` shows two diverging
      commits sharing one common ancestor.

Commit any remaining real changes and leave the repository on
`lower-default-threshold`, ready for Lesson 109 to bring these two
branches back together:

```bash
git add -A
git commit -m "confirm branch divergence between main and lower-default-threshold"
```
