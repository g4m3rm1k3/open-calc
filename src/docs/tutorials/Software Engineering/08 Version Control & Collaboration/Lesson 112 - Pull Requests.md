# Lesson 112: Pull Requests

**What you will build.** The one missing piece connecting every Git
mechanism this domain has taught so far to actual collaboration between
people: a **remote**, a shared copy of `inventory-report/`'s history
that isn't just sitting on one machine, and a real, published branch,
`add-summary-count`, pushed there for someone else to actually see. Then
this lesson does something most introductions to pull requests skip
entirely: it proves, with real, run commands, exactly what a pull
request's own "Files changed" view is built from — not something new,
but a specific, deliberate variant of the `git diff` command this domain
has used since Lesson 106, chosen for a reason this lesson demonstrates
concretely, not just asserts. The transferable problem this lesson is
actually about: a pull request is not a new Git mechanism sitting on top
of everything already learned — there is no `git pull-request` command,
and there never has been. It's a social and procedural wrapper — hosted
by a platform like GitHub or GitLab, not by Git itself — built entirely
out of mechanisms this domain already taught: a pushed branch, a
specific diff comparison, and, once approved, exactly the merge (Lesson
109) or rebase (Lesson 110) this domain already gave full treatment to.

**What you need to know first.** Lesson 106 (Versioned State) directly,
specifically its own full explanation of `git diff`, extended here to a
new comparison this lesson introduces. Lesson 109 (Merging) and Lesson
110 (Rebasing), both directly — this lesson's own final Concept Unit
explains a pull request's "merge" button as nothing more than one of
those two mechanisms, triggered through a platform's interface instead
of a terminal. This lesson also depends on Lesson 108's own full
explanation of what a branch actually is — a name pointing at a commit —
since a remote, this lesson shows directly, is nothing more than a
second, separate repository holding its own copies of exactly that same
kind of pointer.

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

Still **Implementation** and **Integration**. Every merge and rebase this
domain has performed so far happened entirely inside one local
repository, on one machine — a real limitation of the two-engineer
example this domain has carried since Lesson 105, which has always
implied Engineer A and Engineer B work on separate machines without ever
actually modeling that separation. This lesson finally does: pushing
`add-summary-count` to a shared remote is the concrete act of making
Engineer A's or Engineer B's own local branch visible to the other one
at all — nothing before this lesson has ever made that true. A pull
request, opened against that pushed branch, is where **Integration**
stops being something one engineer does alone and becomes something
proposed to the team, discussed, and only completed once someone else
agrees — the actual social shape of Integration this domain's own
pipeline placement has been gesturing at since Lesson 105 without yet
showing.

**Terms used in this lesson.**

- **remote** — a reference, stored inside a repository, pointing at
  another copy of that same repository — typically hosted somewhere
  reachable over a network, though this lesson's own verified
  demonstration uses a local one to keep every command's real output
  provable. It exists because Lesson 105 through Lesson 111 have all
  operated on exactly one repository per example; real collaboration
  requires at least two copies of the same history that can be
  synchronized with each other.
- **`origin`** — the conventional name Git gives a repository's default
  remote, used throughout this lesson; not a reserved keyword, purely a
  naming convention nearly every real project follows, that this lesson
  follows too rather than inventing a different name with no real-world
  precedent.
- **tracking branch** — a local branch configured to know which remote
  branch it corresponds to, so commands like `git push` and `git pull`
  know where to send or fetch from without needing that remote and
  branch name typed out every time. This lesson's own `git push -u`
  command, explained fully below, is the specific act of establishing
  this connection.
- **pull request (PR)** — a request, opened on a hosting platform (not a
  Git command), to merge one branch's commits into another, bundling
  together the exact diff those commits represent, a space for
  discussion and review comments, and, once approved, a button that
  performs an ordinary merge or rebase on the platform's own servers.
  The term exists because "please review and merge this branch" is a
  common enough real need that hosting platforms built dedicated tooling
  around it — tooling this lesson shows is built entirely from
  mechanisms already taught, not a new kind of Git object or operation.
- **base branch / head branch** — the two branches a pull request
  compares: the *base* is the branch changes would be merged *into*
  (commonly `main`); the *head* is the branch actually being proposed
  for merging. These names exist because a pull request, underneath,
  is exactly the two-branch comparison this lesson's own second Concept
  Unit computes directly with `git diff`.

**Objects and methods used.**

- **`git remote add`** (this lesson's own subject)
  - *What it is:* the Git subcommand that registers a new remote — a
    named pointer to another repository — inside the current one.
  - *Implementation:* `git remote add <name> <url>`, where `<name>` is
    conventionally `origin` for a repository's primary remote, and
    `<url>` is wherever that other repository actually lives — a real
    network address (`https://github.com/you/inventory-report.git`) in
    ordinary use, or, as this lesson's own verified commands use
    directly, a local filesystem path, which Git treats identically in
    every respect that matters here.
  - *Its use:* this lesson runs it once, connecting the real
    `inventory-report/` repository to a second, separate repository
    standing in for a shared, hosted copy.
- **`git push`**
  - *What it is:* the Git subcommand that uploads local commits — and
    the branch pointers naming them — to a remote repository.
  - *Implementation:* `git push -u origin <branch>`, where `-u`
    (`--set-upstream`) both performs the push and establishes that
    branch as a tracking branch for future pushes and pulls; a plain
    `git push`, once tracking is established, needs no further
    arguments at all.
  - *Its use:* this lesson runs it twice — once for `main`, establishing
    the shared baseline, and once for `add-summary-count`, publishing
    the specific branch this lesson's own pull request is built around.
- **`git diff <base>...<head>`** (triple-dot form)
  - *What it is:* the same `git diff` subcommand Lesson 106 already gave
    full treatment to, used here with a different argument syntax that
    changes what's actually being compared.
  - *Implementation:* three dots between two branch names (as opposed to
    two dots, or a single space) computes the diff between the head
    branch and the **merge base** — the most recent commit both branches
    share — rather than a direct comparison of the two branches' current
    tips.
  - *Its use:* this lesson uses it specifically because this is the
    exact comparison a pull request's own "Files changed" view is built
    from, proven directly against the two-dot alternative in this
    lesson's own second Concept Unit.

---

## Concept Unit: Publishing a Branch

### The Problem

Every branch this domain has created since Lesson 108 — `main`,
`lower-default-threshold`, `add-restock-alert`, and, most recently,
`add-summary-count` — has existed in exactly one place: the one local
`.git` directory on one machine. Nothing about any command this domain
has run so far has ever made any of that visible anywhere else. A pull
request, by definition, is something opened *against* a branch someone
else can see — which is impossible until that branch exists somewhere
more than one person, or one machine, can reach.

### Project Change

- **Reference Source.** No reference counterpart — continuing this
  domain's own from-scratch running example.
- **Files affected.** None — this Concept Unit connects two
  repositories; no project file is edited.
- **Change type.** Configure.
- **Location.** Run from inside `inventory-report/`.
- **Dependencies.** A second repository to connect to — in real use, an
  empty repository created on a hosting platform; in this lesson's own
  verified commands, a second, local, empty repository, standing in for
  exactly that.

### The New Code

```bash
git remote add origin <url>
git push -u origin main
```

### The Updated Project

No enclosing code structure — two standalone commands. What changes is
directly visible by asking Git which remotes it knows about, before and
after:

```bash
git remote -v
```

before running this Concept Unit's own commands, prints nothing at all —
no remote has been registered yet. Immediately after, the identical
command prints two lines, one for fetching and one for pushing, both
naming `origin` and the URL it points at.

### Isolating the Concept: Two Repositories, Connected

Before trusting this on the real project, prove the underlying mechanism
on the smallest possible throwaway example — two entirely separate
repositories, one standing in for a hosting platform's own copy:

```bash
mkdir remote-lab && cd remote-lab
git init --bare -q shared.git
git init -q local
cd local
git config user.name "Test User"
git config user.email "test@example.com"
printf 'apple\nbanana\n' > fruits.txt
git add fruits.txt
git commit -q -m "add fruits list"
git remote add origin ../shared.git
git push -u origin main
```

prints:

```text
branch 'main' set up to track 'origin/main'.
To ../shared.git
 * [new branch]      main -> main
```

Confirm the second repository, `shared.git`, really does now hold this
commit — not by trusting the confirmation message, but by cloning it
fresh, into a third, brand-new directory, and reading its own history
directly:

```bash
cd ..
git clone -q shared.git verify
cd verify
git log --oneline
```

prints:

```text
a1b2c3d add fruits list
```

The identical commit, the identical hash, recovered entirely from
`shared.git` — a completely separate directory `local/` never touched
directly — direct, concrete proof the push really did transfer real
history, not just a label. This `remote-lab/` directory, including all
three of its own repositories, is discarded now.

### Mechanical Walkthrough

Every distinct element of the real project's own two commands, walked
through against the values shown in the Run It step below:

- **`git remote add origin <url>`** — `remote` is the subcommand family
  governing connections to other repositories; `add` is the specific
  operation that registers a new one; `origin`, per this lesson's own
  header term, is the conventional name, not a requirement — a
  repository can have remotes with any name, and more than one at once,
  though this lesson's own example needs only the one.
- **`git push -u origin main`** — `push` is the subcommand that uploads
  commits; `-u` establishes `main` as a tracking branch, per this
  lesson's own header term, for `origin`'s own `main`; `origin` names
  which registered remote to push to (the same name just registered);
  `main` names which local branch to push.
- **`branch 'main' set up to track 'origin/main'.`** — confirms the
  tracking relationship specifically, printed once, the first time a
  branch is pushed with `-u`; a subsequent, ordinary `git push` on the
  same branch needs no arguments at all, because Git already knows,
  from this exact line's own effect, where it should go.
- **`* [new branch]      main -> main`** — confirms the actual data
  transfer: a new branch, named `main` on both sides, now exists on the
  remote where it didn't before.

### CS Lens

A remote, and the tracking-branch relationship `-u` establishes, is a
real example of **replication**: maintaining more than one copy of the
same data (here, the same commit history) in more than one location,
with an explicit mechanism (`push`, and, in the other direction, `fetch`
or `pull`, not this lesson's own primary subject) for propagating
changes between them, rather than one single, exclusively authoritative
copy. Also recognized in: a database replica kept in sync with a primary
for read scalability or failover, a content delivery network caching
copies of the same files across many geographically distributed servers,
and version-controlled configuration deployed identically to a fleet of
machines, each one a real, independent copy rather than a single shared
resource everyone reaches over the network for every read.

### SE Lens

The alternative to a proper remote — email zips, shared network drives,
the exact manual-copy chaos Lesson 105 opened this entire domain by
rejecting — was already ruled out for a single machine's own history;
this Concept Unit proves the identical reasoning holds once more than
one machine is involved. A remote's real cost, worth naming honestly:
it requires actual infrastructure — a server somewhere, an account,
network access — that a purely local `.git` directory never needed.
Every lesson before this one in this domain worked entirely offline;
this is the first that genuinely requires two separate places for
history to exist.

### Commands Needed

- **`git remote add`** — no separate installation; requires a URL (or,
  in this lesson's own verified demonstration, a local path) pointing at
  another repository, which itself must already exist.
- **`git push -u`** — no separate installation; requires the remote
  named in the command to already be registered via `git remote add`.

### Run It

From inside the real `inventory-report/` project:

```bash
git remote add origin ../origin.git
git push -u origin main
```

prints:

```text
branch 'main' set up to track 'origin/main'.
To ../origin.git
 * [new branch]      main -> main
```

Publishing the feature branch this lesson's own next Concept Unit needs:

```bash
git switch add-summary-count
git push -u origin add-summary-count
```

prints:

```text
branch 'add-summary-count' set up to track 'origin/add-summary-count'.
To ../origin.git
 * [new branch]      add-summary-count -> add-summary-count
```

Both branches now exist in two places: the real, local
`inventory-report/` repository, and the separate repository `origin`
points at — standing in, for this lesson's own verified purposes, for a
hosting platform's own copy.

### Connecting Back

`add-summary-count` is now visible somewhere beyond the one machine it
was created on — the concrete precondition, per this Concept Unit's own
Problem step, for anything resembling a real pull request to exist at
all. The next Concept Unit computes exactly what that pull request would
actually show.

---

## Concept Unit: What a Pull Request's Diff Actually Compares

### The Problem

`add-summary-count` was branched from `main` before `main` gained its
own later commit — a docstring added directly to `low_stock_items`,
independent of anything `add-summary-count` did. A person opening a
pull request to merge `add-summary-count` into `main` wants to see one
specific thing: what does *this branch's own work* actually add? Not
what's different between the two branches' current tips in general,
which would also show the docstring's own removal from
`add-summary-count`'s point of view — a change nobody on this branch
ever made or intended to make. Does plain `git diff`, exactly as Lesson
106 already taught it, answer the right question here?

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** None — read-only comparison.
- **Change type.** N/A.
- **Location.** Run from inside `inventory-report/`.
- **Dependencies.** `main`, holding the independent docstring commit;
  `add-summary-count`, holding the independent `summary_count` commit;
  both diverged from a shared ancestor.

### The New Code

```bash
git diff main...add-summary-count
```

### The Updated Project

No enclosing structure — a read-only comparison, same as every other
`git diff` variant this domain has used.

### Isolating the Concept: Two Dots Versus Three

Before trusting this on the real project, prove the actual difference
between two-dot and three-dot comparisons on the smallest possible
throwaway example, using the `remote-lab/`-style setup from this
lesson's own first Concept Unit — a fresh repository, one branch adding
a line, `main` independently adding a different one:

```bash
mkdir lab && cd lab
git init -q
git config user.name "Test User"
git config user.email "test@example.com"
printf 'apple\nbanana\n' > fruits.txt
git add fruits.txt
git commit -q -m "add fruits list"
git branch feature
git switch feature
printf 'apple\nbanana\ncherry\n' > fruits.txt
git commit -qam "feature: add cherry"
git switch main
printf 'apple\nbanana\ndate\n' > fruits.txt
git commit -qam "main: add date"
git diff main..feature
```

The two-dot form prints:

```text
diff --git a/fruits.txt b/fruits.txt
index <hash1>..<hash2> 100644
--- a/fruits.txt
+++ b/fruits.txt
@@ -1,3 +1,3 @@
 apple
 banana
-date
+cherry
```

This shows `date` being *removed* — something `feature` never actually
did; `date` doesn't even exist on `feature`, because `feature` branched
off before `main` ever added it. Now the three-dot form:

```bash
git diff main...feature
```

prints:

```text
diff --git a/fruits.txt b/fruits.txt
index <hash1>..<hash3> 100644
--- a/fruits.txt
+++ b/fruits.txt
@@ -1,2 +1,3 @@
 apple
 banana
+cherry
```

Only `cherry` being added — exactly, and only, what `feature` actually
did. This is called comparing against the **merge base** — the most
recent commit both branches share, found directly with `git merge-base
main feature` — rather than comparing the two tips directly. This `lab/`
directory is discarded now.

### Mechanical Walkthrough

Every distinct element of the real project's own two-dot-versus-
three-dot comparison, walked through against the values shown in the Run
It step below:

- **`git diff main..add-summary-count`** (two dots) — computes the
  direct difference between `main`'s current tip and
  `add-summary-count`'s current tip, with no reference to their shared
  history at all; this is the identical form of `git diff` Lesson 106
  already gave full treatment to, applied here to two branch names
  instead of working-directory-versus-staged.
- **`git diff main...add-summary-count`** (three dots) — first computes
  the merge base (using the identical logic `git merge-base` performs
  directly, and the identical logic `git merge` and `git rebase`
  themselves already use internally, per Lessons 109 and 110), then
  diffs only from that shared point forward to `add-summary-count`'s own
  tip — deliberately excluding anything that happened on `main` alone
  since the branches diverged.
- **The removed docstring line, present only in the two-dot output** —
  direct, concrete proof of the Problem step's own concern: the two-dot
  form makes it look as though `add-summary-count` deleted a docstring
  it never touched, purely because `main` gained one after the branch
  point and `add-summary-count` never did.

### CS Lens

The three-dot comparison is a direct application of the identical
**merge base** concept Lesson 109's own `three-way merge` term already
named in full — the same "compare against the common ancestor, not
directly against each other" logic, reused here for display purposes
instead of for actually combining two histories. Also recognized in:
comparing two edited copies of a shared document against their last
common save point, rather than against each other directly, to see what
each editor individually contributed; and a version-controlled
configuration system diffing a proposed change against the last
deployed state specifically, rather than against whatever the
configuration happens to look like on some unrelated, independently
updated system right now.

### SE Lens

The alternative — a pull request tool built on the simpler, two-dot
comparison — would produce exactly the confusing, misleading result this
Concept Unit's own isolated lab just proved: reviewers seeing changes
attributed to a branch that branch never actually made, purely because
of unrelated activity on the base branch in the meantime. This isn't a
hypothetical design flaw avoided by luck; it's the concrete, provable
reason every major hosting platform's own pull request diff view is
built on three-dot semantics, not two-dot — a real design decision with
a real, demonstrated failure mode behind it, not an arbitrary default.

### Commands Needed

- **`git diff <base>...<head>`** — no separate installation; the
  triple-dot syntax is a standard part of `git diff` itself, alongside
  `git log`, which supports the identical syntax for listing commits
  rather than showing their combined diff.

### Run It

From inside the real `inventory-report/` project:

```bash
git diff main...add-summary-count
```

prints:

```text
diff --git a/inventory_report.py b/inventory_report.py
index 286087b..3e76356 100644
--- a/inventory_report.py
+++ b/inventory_report.py
@@ -10,3 +10,6 @@ def restock_alert(inventory, threshold=3):
 
 def reorder_suggestion(inventory, threshold=3, target=15):
     return {name: target - count for name, count in inventory.items() if count < threshold}
+
+def summary_count(inventory, threshold=3):
+    return len(low_stock_items(inventory, threshold))
```

Exactly the `summary_count` addition, nothing else — no trace of the
docstring `main` independently gained. Compare this directly against the
two-dot form:

```bash
git diff main..add-summary-count
```

prints the identical `summary_count` addition, but also shows the
docstring line prefixed `-`, as if `add-summary-count` had removed it —
confirming, on the real project this time, exactly the misleading result
the isolated lab already predicted.

### Connecting Back

`git diff main...add-summary-count` is, concretely, what a pull request
opened right now against these two branches would actually display as
its "Files changed" view — proven directly, not asserted. The final
Concept Unit places that diff inside the rest of what a pull request
actually is.

---

## Concept Unit: The Pull Request Itself

### The Problem

A pushed branch (this lesson's first Concept Unit) and a correct diff
(this lesson's second) are both real and both provable with plain Git
commands. Neither one, on its own, is a pull request. A pull request
adds three things neither Git command produces: a place for other people
to leave comments on specific lines, a record of who has and hasn't yet
approved the change, and a button that, once approved, actually performs
the integration. What, concretely, is that button doing?

### Project Change

- **Reference Source.** No reference counterpart — this Concept Unit is
  deliberately not a runnable command sequence; a pull request is a
  platform feature, not a Git operation, and this domain does not
  fabricate a fake command to pretend otherwise.
- **Files affected.** None directly.
- **Change type.** N/A.
- **Location.** N/A.
- **Dependencies.** Everything this lesson's own first two Concept Units
  already produced: a pushed branch, and a known, correct diff.

### The New Code

There is no new command for this Concept Unit — its own point is that
none is needed. What a pull request's own "Merge" button does, stated
precisely rather than as a black box:

- **"Merge pull request"** performs exactly Lesson 109's own `git merge`,
  on the platform's own server copy of the repository, producing exactly
  the same kind of two-parent merge commit this domain already proved
  with `git cat-file`.
- **"Squash and merge"** — a variant this domain hasn't run directly —
  first combines every commit on the head branch into one single new
  commit (discarding their individual history, keeping only the
  combined diff), then merges that one commit — closer in spirit to
  Lesson 110's own rebase, in that it produces new commit objects rather
  than reusing the originals.
- **"Rebase and merge"** performs exactly Lesson 110's own `git rebase`,
  replaying the head branch's commits onto the base branch, followed by
  the fast-forward Lesson 109's own first Concept Unit already proved is
  what a rebase, done first, enables.

### The Updated Project

Not applicable in the usual sense — this Concept Unit's own "update" is
conceptual: a reader who has completed this domain's own Lessons 109
through 112 now has every piece needed to understand what happens,
mechanically, the moment any of these three buttons is clicked, on any
real hosting platform, for any real project.

### Isolating the Concept: There Is No Isolated Lab for This One

Every other Concept Unit in this entire domain has included a throwaway,
runnable example specifically because its own subject was a real Git
command with real, provable output. A pull request itself has no such
form — it's a feature of a hosting platform's own web interface and
API, layered entirely on top of the plain Git operations this domain has
already demonstrated in full, real, run form: `git push` (this lesson's
first Concept Unit), `git diff <base>...<head>` (this lesson's second),
and `git merge` or `git rebase` (Lessons 109 and 110). Isolating "a pull
request" the way this domain has isolated every other concept would mean
isolating a web application's own database schema and button-click
handler — genuinely outside this domain's own scope, which has been,
consistently, Git and the concepts version control teaches generally,
not any one specific hosting platform's own product.

### Mechanical Walkthrough

There is no new syntax to enumerate here — this Concept Unit's entire
content is the restatement, in the New Code step above, of exactly which
already-taught mechanism each of a pull request's own three merge
options actually performs.

### CS Lens

A pull request is a real example of a **facade**: a simpler, higher-level
interface built in front of a more complex underlying system, exposing
only the operations a specific audience actually needs, without hiding
that the underlying system is still fully real and still directly
reachable. Also recognized in: a car's accelerator pedal, a simple
interface in front of the genuinely complex combustion or electric
process actually producing motion; a library's high-level search box,
built in front of the same underlying catalog a librarian could also
query directly with more specialized tools; and a graphical file manager
's "delete" button, which performs the identical underlying file-removal
operation a command-line `rm` would, just reached through a different
interface.

### SE Lens

The alternative — every collaborator running `git push`, `git diff
<base>...<head>`, and `git merge` by hand, coordinating entirely by
direct conversation — is exactly what this domain's own two-engineer
example implicitly did all the way through Lesson 111, and it's not
actually wrong, only missing the parts a platform adds for free: a
permanent, searchable record of who reviewed what and said what about
it, line-level comments attached to the exact code they refer to, and
automated checks (this domain's own future testing and CI/CD-adjacent
lessons' subject, not this one's) that can block the merge button until
they pass. The real cost of the facade: a person who only ever clicks
"Merge pull request" and never learns what it actually performs is
vulnerable to exactly the confusion this domain's own earlier lessons
already named directly — Lesson 110's rebased-shared-history mess, or
Lesson 111's rebase-versus-merge-conflict labeling difference — the
moment something about a specific pull request doesn't go the way the
button's own simple interface implied it would.

### Commands Needed

None — this Concept Unit's own point is that its three named operations
are exactly the commands Lessons 109 and 110 already gave full
treatment to.

### Run It

Not applicable — there is no command to run. The "result" this Concept
Unit produces is understanding, not output: a pull request merged on any
real hosting platform, using any of its three merge options, produces a
commit graph a reader of this lesson could open with `git cat-file -p`
and correctly predict the shape of in advance — one parent for a
rebase-and-merge, two for an ordinary merge, one newly synthesized
commit with no individual history preserved for a squash-and-merge.

### Connecting Back

Every piece this domain has built since Lesson 105 is now connected:
comparing files by hand (Lesson 105) led to a repository (Lesson 105) to
track changes properly, staging and committing (Lessons 106–107) made
those changes real and permanent, branching (Lesson 108) let more than
one line of work exist at once, merging and rebasing (Lessons 109–110)
brought divergent work back together — sometimes cleanly, sometimes
requiring a real human decision (Lesson 111) — and this lesson's own
remote and diff comparison finally made all of it visible to more than
one person, wrapped, on any real hosting platform, in exactly the
"Pull Request" interface this lesson just opened up completely.

---

## Connect the Pieces

Trace `add-summary-count` through this entire lesson. It began exactly
where Lesson 108 left every branch in this domain — real, but entirely
local, invisible to anyone but whoever's machine it was created on.
`git remote add` and `git push -u`, this lesson's own first Concept
Unit, changed that concretely: a second, independent repository now
holds an exact copy of its own commit history, proven not by trusting
the push's own confirmation message but by cloning that second
repository fresh and reading the commit back out of it directly. `git
diff main...add-summary-count`, this lesson's own second Concept Unit,
then computed exactly what a reviewer — or a pull request's own "Files
changed" tab — would need to see: not a raw comparison of two branch
tips, which the isolated lab proved shows misleading, unintended
deletions, but a comparison from the two branches' actual shared
history, showing only what this branch itself contributed. And the
final Concept Unit named, precisely, what happens next on any real
platform: a "Merge pull request" click performing Lesson 109's own `git
merge`; a "Rebase and merge" click performing Lesson 110's own `git
rebase`. No new mechanism, anywhere in this lesson, that this domain
hadn't already taught in full — only the missing piece of infrastructure
(a remote) and the missing piece of comparison logic (three-dot diffing)
needed to make everything already learned actually work between two
separate people.

## What Breaks Without This

Cause the real, specific failure the two-dot-versus-three-dot distinction
exists to prevent — reviewing a pull request using the wrong comparison,
and being misled by it. From inside the real `inventory-report/`
project:

```bash
git diff main..add-summary-count
```

prints, among its real output, this line, already shown once in this
lesson's own second Concept Unit:

```text
-    """Return names of items at or below the given threshold."""
```

A reviewer trusting this two-dot comparison, without knowing to prefer
the three-dot form, would see this line and could reasonably ask, in a
real review comment, "why does this pull request delete the docstring
on `low_stock_items`?" — a real, wasted round of confusion and
clarification over a change that was never actually made. Every major
hosting platform avoids this specific failure by building its own
comparison view on three-dot semantics internally — proven, not merely
claimed, by this lesson's own second Concept Unit already running both
forms side by side and finding this exact line only in the two-dot
output. Confirm the fix directly:

```bash
git diff main...add-summary-count
```

prints no such line — the docstring never appears at all, because it
was never part of what `add-summary-count` actually changed.

## Exercises

1. On the real `inventory-report/` project (or a throwaway repository of
   your own), create a branch, commit one change to it, then make an
   independent, unrelated commit directly on `main`. Run both `git diff
   main..<branch>` and `git diff main...<branch>` and, before reading
   either output, predict in writing which lines you expect to differ
   between the two.
2. Run `git merge-base main add-summary-count` directly against the real
   project and confirm the hash it prints matches the commit you'd
   identify, by reading `git log --oneline --all --graph --decorate`, as
   the actual point where the two branches diverged.
3. Using the real `origin` remote this lesson set up, run `git fetch
   origin` (a command this lesson didn't formally teach, downloading a
   remote's own current state without merging it in) followed by `git
   log origin/main..main`. Explain, in your own words, what an empty
   result from this specific command would mean about whether your local
   `main` has any commits the remote doesn't yet have.

## Definition of Done

- [ ] `inventory-report/` has a real, working `origin` remote,
      confirmed with `git remote -v`.
- [ ] At least two branches, `main` and `add-summary-count`, have been
      pushed with `git push -u`, confirmed by cloning the remote fresh
      into a separate directory and reading their history back out.
- [ ] `git diff main..add-summary-count` and `git diff
      main...add-summary-count` have both been run, and the specific
      line that differs between them has been identified and explained.
- [ ] You can state, without looking anything up, which of a pull
      request's three common merge options corresponds to which
      already-taught Git command from Lessons 109 and 110.

Commit the real, final state:

```bash
git add -A
git commit -m "publish add-summary-count and confirm three-dot diff semantics"
git push origin main
```
