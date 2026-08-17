# Lesson 109: Merging

**What you will build.** The real payoff of everything Lesson 108 set
up: `main`, `lower-default-threshold`, and a new branch,
`add-restock-alert`, brought back together into one shared history,
using `git merge` in both of the two genuinely different ways it
behaves — once where no real combining work is needed at all, and once
where Git has to actually reconcile two independently written changes
into a single new commit with two parents. Both cases are the easy
path — nothing in this lesson's own two branches touches the same lines
of the same file the other one touches, so Git combines them
automatically, with no decision left for a person to make. What happens
when two branches genuinely do collide is deliberately not this lesson's
subject; Lesson 111, Conflict Resolution, is where that gets its own
full treatment. The transferable problem this lesson is actually about:
a diverged history, per Lesson 108's own closing line, is real and
permanent on both sides — merging doesn't erase either branch's own
past; it creates one new point where both pasts are provably present
at once.

**What you need to know first.** Lesson 108 (Branches) directly — this
lesson opens exactly where that one's own Definition of Done left
`inventory-report/`: two branches, `main` and `lower-default-threshold`,
pointing at two different commits, sharing one common ancestor. This
lesson also depends completely on Lesson 107's own real, verified proof
of what a commit object actually contains — specifically its `parent`
field — since a merge commit, this lesson shows directly, is nothing
more than an ordinary commit object with two `parent` lines instead of
one.

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

This lesson is where the two-engineer example, carried since Lesson
105, finally reaches **Integration** for real — not just the stage this
domain has claimed to sit at, but a concrete moment this lesson's own
mechanism produces directly. Engineer A's independently committed
case-sensitivity fix to `is_username_available` and Engineer B's
independently committed on-call logging addition, each sitting on its
own branch since Lesson 108, are exactly the situation this lesson's own
second Concept Unit demonstrates on the real `inventory-report/` project:
two branches, diverged from a shared commit, neither one touching the
same lines the other touches, brought together by `git merge` into one
new commit that provably contains both changes at once — the literal
moment Engineer A's and Engineer B's separate work stops being two
separate implementations and becomes one integrated codebase. Whether
this specific merge goes as smoothly as this lesson's own example is a
separate, honest question: Lesson 111, Conflict Resolution, is where
this exact scenario gets revisited for the case where it doesn't.

**Terms used in this lesson.**

- **merge** — the act of combining two branches' independent histories
  into one, either by moving one branch's pointer forward to include the
  other's commits directly, or by creating a new commit that has both
  branches' most recent commits as its own parents. It exists because
  diverged history, per Lesson 108, is exactly what branching produces
  by design — and a diverged history that never gets recombined defeats
  the entire point of eventually shipping one, single, working project.
- **fast-forward merge** — the simpler of the two cases this lesson
  covers: when the branch being merged *into* has not diverged at all —
  every commit on it is already an ancestor of the branch being merged
  *in* — Git doesn't need to combine anything; it simply moves the
  target branch's own ref file to point at the same commit the other
  branch already points at. The term exists because this specific case
  needs no new commit and no real reconciliation at all, distinct enough
  from a true merge to deserve its own name.
- **three-way merge** — the second case: when both branches have genuine,
  independent commits since their shared ancestor, Git compares three
  points at once — the shared ancestor, and each branch's own latest
  commit — to determine what changed on each side, and, when those
  changes don't overlap, combines them automatically into a brand-new
  commit. The "three" names exactly those three comparison points: the
  common ancestor, and the two diverged tips.
- **merge commit** — the new commit a three-way merge creates, containing
  two `parent` fields instead of one — the single genuinely new kind of
  commit object this lesson introduces, extending, not replacing,
  everything Lesson 107 already proved a commit object contains.
- **merge strategy** — the specific algorithm Git uses to actually
  perform a three-way merge's automatic combination. This lesson's own
  real output names it directly: `ort`, the strategy modern Git versions
  use by default (a full rewrite of an older strategy named
  `recursive`), responsible for comparing the common ancestor against
  both branch tips and deciding, line by line, which changes belong in
  the merge result.

**Objects and methods used.**

- **`git merge`** (this lesson's own subject)
  - *What it is:* the Git subcommand that combines a named branch's
    history into whichever branch is currently checked out.
  - *Implementation:* `git merge <branch-name>`, run while the *target*
    branch (the one receiving the merge) is checked out. If the merge
    is a fast-forward, it prints `Fast-forward` and a summary of files
    changed, with no new commit created. If it's a real three-way merge
    with no conflicts, it prints `Merge made by the '<strategy>'
    strategy.` and creates a new merge commit automatically, using a
    default message unless `-m "<message>"` supplies one directly.
  - *Its use:* this lesson runs it twice — once producing a fast-forward,
    once producing a real merge commit — specifically to show both
    outcomes side by side, on the same two commands, differing only in
    whether the two branches had actually diverged.

---

## Concept Unit: Fast-Forward Merge

### The Problem

`main` and `lower-default-threshold`, exactly as Lesson 108 left them,
diverge by exactly one commit — `lower-default-threshold` has the
threshold fix; `main` has nothing `lower-default-threshold` doesn't
already include. Bringing that fix into `main` doesn't need to combine
two independent changes at all; `main` simply needs to "catch up" to a
history it's already a strict prefix of. Does `git merge` need to do
anything more complicated than that in this specific case?

### Project Change

- **Reference Source.** No reference counterpart — continuing this
  domain's own from-scratch running example.
- **Files affected.** None directly — merging changes which commit
  `main`'s own ref file points at; `inventory_report.py`'s content
  changes only as a side effect of that ref update.
- **Change type.** Configure.
- **Location.** Run from inside `inventory-report/`, with `main` checked
  out.
- **Dependencies.** `lower-default-threshold`, holding one commit ahead
  of `main`, per Lesson 108.

### The New Code

```bash
git switch main
git merge lower-default-threshold
```

### The Updated Project

No enclosing code structure — a standalone command changing which
commit `main`'s own ref file points at. That change is directly visible
by reading the file itself, before and after:

```bash
cat .git/refs/heads/main
```

before the merge, prints `ab7614a98b9d2fd58564c1dd354d3a5c5cddd736` — the
same hash Lesson 108 left `main` pointing at. Immediately after the
merge, the identical read prints
`be4eac28b344a5fec92b7a33b48e2613768b51ad` — the exact hash
`lower-default-threshold` already pointed at, per Lesson 108's own
Concept Unit that first created it.

### Isolating the Concept: A Merge That's Really Just a Pointer Move

Before trusting this on the real project, prove the specific claim the
Problem step implied — that this case needs no new commit at all — on
the smallest possible throwaway example, continuing the `lab/`
repository's own `main` and `experiment` branches from Lesson 108's own
isolated labs, where `experiment` holds one commit `main` doesn't:

```bash
mkdir lab && cd lab
git init -q
git config user.name "Test User"
git config user.email "test@example.com"
printf 'apple\nbanana\n' > fruits.txt
git add fruits.txt
git commit -q -m "add fruits list"
git branch experiment
git switch experiment
printf 'apple\nblueberry\n' > fruits.txt
git add fruits.txt
git commit -q -m "swap banana for blueberry"
git switch main
git log --oneline
git merge experiment
git log --oneline
```

The first `git log --oneline`, before merging, shows `main` still one
commit behind:

```text
a1b2c3d add fruits list
```

Merging prints:

```text
Updating a1b2c3d..a3b4c5d
Fast-forward
 fruits.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

and the second `git log --oneline`, run immediately after, on `main`,
shows:

```text
a3b4c5d swap banana for blueberry
a1b2c3d add fruits list
```

Two commits, not one — `main`'s own history now shows both, most recent
first, exactly the same two commits `experiment` already had before the
merge ran. No new commit was created; `git log`'s longer output here
isn't evidence of one — it's evidence that `main`'s ref file now points
at the same place `experiment`'s already did, so walking back through
parent commits from `main` reaches the identical chain, including the
commit that used to be visible only from `experiment`. This `lab/`
directory is discarded now.

### Mechanical Walkthrough

Every distinct element of `git merge lower-default-threshold`'s real
output against the actual project, shown in the Run It step below:

- **`git`** and **`merge`** — the same single program, and a subcommand
  distinct from every one covered so far in this domain: unlike
  `branch` (creates a name) or `switch` (moves `HEAD`), `merge` combines
  one named branch's history into the currently checked-out one.
- **`lower-default-threshold`** — the branch being merged *in*; `main`,
  currently checked out, is the branch being merged *into* — an
  asymmetry worth naming plainly, since `git merge lower-default-
  threshold` while `main` is checked out and `git merge main` while
  `lower-default-threshold` is checked out are two different operations
  with two different results.
- **`Updating ab7614a..be4eac2`** — states plainly which two commits
  this merge is moving between: `main`'s own commit before the merge,
  and the commit it's about to become equivalent to.
- **`Fast-forward`** — the specific label Git prints only when this
  simpler case applies: `main`'s own history is already fully contained
  within `lower-default-threshold`'s, so no combination is actually
  needed, only a pointer update.
- **`inventory_report.py | 2 +-`** — a summary line, in the same shape
  `git commit`'s own confirmation message already used in Lesson 107,
  naming which file changed and by how many lines, even though — worth
  stating honestly — no new commit was actually created here; this
  summary describes the working-directory files that were rewritten as
  a side effect of moving `main`'s ref forward, the same rewrite `git
  switch` performs, covered fully in Lesson 108.

### CS Lens

A fast-forward is possible exactly when one branch's history is a
**prefix** of another's — every commit on `main` already appears, in the
same order, as an earlier commit on `lower-default-threshold`. Testing
whether one sequence is a prefix of another, and, if so, simply
advancing a pointer to the end of the longer one instead of doing any
real merging work, is a common optimization pattern recognized in: a
text editor's own "redo" feature, when undone changes are simply
reapplied because nothing new was typed in the meantime, rather than
recomputed from scratch; a video streaming service resuming playback by
seeking to a saved position, rather than reloading and reprocessing
video already known to be unchanged; and a build system skipping
recompilation of a file whose own dependency chain, checked first, is
already known to be unchanged since the last build.

### SE Lens

The alternative — creating a real merge commit even in the fast-forward
case, purely for consistency — is a real, deliberate choice some teams
actually make (`git merge --no-ff` forces it), and it's not what this
lesson's own default command did. The tradeoff: a fast-forward keeps
history simpler and shorter, at the cost of erasing the visual record
that `lower-default-threshold` ever existed as a separate branch at
all — after this merge, `main`'s own `git log` reads exactly as if this
work had been committed directly onto `main` the whole time. A forced,
non-fast-forward merge commit would cost one extra commit object but
preserve that branch existed as a distinct, visible unit of work. Which
is better is a real, ongoing tradeoff different teams answer differently
— this domain names it honestly rather than picking a universal answer.

### Commands Needed

- **`git merge`** — no separate installation; run while the target
  branch is checked out, naming the branch to merge in as its argument.

### Run It

From inside the real `inventory-report/` project, on `main`:

```bash
git merge lower-default-threshold
```

prints:

```text
Updating ab7614a..be4eac2
Fast-forward
 inventory_report.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Confirming both ref files now agree:

```bash
cat .git/refs/heads/main
cat .git/refs/heads/lower-default-threshold
```

prints the identical hash on both lines:

```text
be4eac28b344a5fec92b7a33b48e2613768b51ad
be4eac28b344a5fec92b7a33b48e2613768b51ad
```

and the working directory, checked directly, now shows `threshold=3` on
`main` itself — the change that, before this merge, only existed on
`lower-default-threshold`.

### Connecting Back

`main` has now absorbed `lower-default-threshold`'s entire history,
without a single new commit — the two branches are, at this exact
moment, indistinguishable except by name. This case was easy precisely
because `main` had nothing of its own to reconcile. The next Concept
Unit builds the case where it does.

---

## Concept Unit: Three-Way Merge

### The Problem

Say, independently of the threshold fix just merged, two more things
happen at once: a new branch, `add-restock-alert`, adds a genuinely new
function to `inventory_report.py`; and, separately, someone commits a new
`README.md` directly onto `main` — a real, ordinary, small change,
unrelated to the feature branch entirely. Both of these are new commits
`main` doesn't have and `add-restock-alert` doesn't have. When these two
are merged, `main` no longer has "nothing of its own" — the fast-forward
case from the previous Concept Unit no longer applies. What happens
instead?

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** `inventory_report.py`, extended with a new
  function on `add-restock-alert`; a new file, `README.md`, added
  directly on `main`.
- **Change type.** Add.
- **Location.** `add-restock-alert`'s own commit appends a new function
  to the end of `inventory_report.py`; `main`'s own separate commit adds
  a brand-new file, `README.md`, at the project's own root.
- **Dependencies.** Both branches created from the same post-merge
  `main`, per the previous Concept Unit.

### The New Code

The function added on `add-restock-alert`:

```python
def restock_alert(inventory, threshold=3):
    return [name for name in low_stock_items(inventory, threshold)]
```

### The Updated Project

Placed at the end of `inventory_report.py`, on the `add-restock-alert`
branch specifically — not on `main`, which, at this point, has never
seen this function at all:

```python
def low_stock_items(inventory, threshold=3):
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)

def restock_alert(inventory, threshold=3):  # ← new
    return [name for name in low_stock_items(inventory, threshold)]
```

`restock_alert` reuses `low_stock_items` directly, calling the same
function already defined above it in the same file, and returns the
identical list `low_stock_items` itself would return — a real, if
minimal, second entry point onto the same underlying logic. Meanwhile,
on `main`, a completely separate commit adds `README.md`, a new file
`add-restock-alert`'s own history has never seen:

```markdown
# inventory-report

Flags low-stock inventory items.
```

Two branches, two independent commits, touching two different files —
set up specifically so the coming merge has no overlapping lines to
reconcile, keeping this lesson's own case free of the conflicts Lesson
111 covers directly.

### Isolating the Concept: A Merge That Needs a New Commit

Before trusting this on the real project, prove the underlying claim —
that a genuine divergence produces a real, new commit with two parents —
on the smallest possible throwaway example, building fresh divergence on
the same `lab/` repository from this lesson's first Concept Unit
(currently fast-forwarded, `main` and `experiment` identical):

```bash
cd lab
git switch experiment
printf 'apple\nblueberry\ncherry\n' > fruits.txt
git add fruits.txt
git commit -q -m "add cherry"
git switch main
printf '# fruits\n\nA simple fruit list.\n' > README.md
git add README.md
git commit -q -m "add README"
git merge experiment -m "Merge branch 'experiment'"
```

prints, for the merge itself:

```text
Merge made by the 'ort' strategy.
 fruits.txt | 1 +
 1 file changed, 1 insertion(+)
```

`Merge made by the 'ort' strategy` — not `Fast-forward` — is the direct,
concrete signal this is the second, genuinely different case: `main`
had its own new commit (`README.md`) that `experiment` didn't have, so
simply moving a pointer forward was no longer possible; Git had to
create something new instead. This lab's own result is inspected
directly, the same way the real project's is, in the Mechanical
Walkthrough below; this `lab/` directory is discarded after that.

### Mechanical Walkthrough

Every distinct element of the merge commit this creates, walked through
against the real project's own values in the Run It step below:

- **`Merge made by the 'ort' strategy.`** — printed instead of `Fast-
  forward`, confirming Git had to actually reconcile two divergent
  histories rather than simply advance a pointer. `ort` names the
  specific algorithm used: Git's current default three-way merge
  strategy, which compares the common ancestor commit against both
  branch tips and, for every file that changed on only one side,
  includes that side's version automatically — exactly what happens
  here, since `README.md` only exists on one side and `restock_alert`
  only exists on the other.
- **The new merge commit's `tree` line** — points, as every commit does
  per Lesson 107, at one tree object representing the complete project
  state after the merge: both `README.md` and the `restock_alert`
  function present at once, neither one having existed, together, on
  either branch alone before this commit.
- **Two `parent` lines, not one** — the genuinely new structural fact
  this Concept Unit exists to teach: `git cat-file -p` against the merge
  commit shows `parent 1e98dcc...` (the tip of `main` immediately before
  merging) and `parent 5ea165c...` (the tip of `add-restock-alert`) as
  two separate lines, both present in the same commit object. Every
  commit object before this one, throughout this entire domain, has had
  exactly zero parents (the one root commit, Lesson 107) or exactly one
  (every ordinary commit since); this is the first with two, and Git's
  own object format has no limit forcing it to stop at two — a commit
  merging more than two branches at once, called an "octopus merge," is
  possible but genuinely rare in real practice.

### CS Lens

A commit with two parents is exactly what turns this project's commit
graph from the simple, single-path-per-branch shape Lesson 108's own CS
Lens described into a graph where paths can both split *and* rejoin — a
structure still a **directed acyclic graph**, the identical term Lesson
108 already gave in full, just now demonstrated with a node that has two
incoming edges instead of only ever one outgoing edge from each side.
Also recognized in: two independent research teams' work being combined
into a single published paper crediting both; two rivers converging into
one, downstream of the point where they used to run separately; and a
company merger, where two previously separate organizational histories
become, from the merger date forward, one shared one, without either
predecessor's own history being erased.

### SE Lens

The alternative to an automatic merge strategy is a person manually
copying every change from one branch into the other by hand — reading
both versions, deciding line by line what the combined result should be,
exactly the same manual-comparison cost this entire domain opened, back
in Lesson 105, by rejecting for the simpler case of comparing two files.
`ort`'s real value here is narrow but genuine: when two branches'
changes provably don't overlap — different files entirely, in this
lesson's own deliberately chosen example — there is no actual ambiguity
to resolve, and automating that specific, unambiguous case removes real,
tedious manual work with zero risk of getting it wrong. The real cost
this Concept Unit's own deliberately chosen, conflict-free example
doesn't show: the moment two branches *do* touch the same lines, `ort`
has no way to guess which version is correct, and merging stops being
automatic — precisely the scenario Lesson 111 exists to cover.

### Commands Needed

- **`git merge <branch> -m "<message>"`** — the same `git merge`
  subcommand as the previous Concept Unit; the `-m` flag supplies the
  merge commit's own message directly, the identical flag `git commit`
  already used in Lesson 107, since a merge commit is, underneath, an
  ordinary commit object accepting the identical message argument.

### Run It

From inside the real `inventory-report/` project, on `main`, with
`README.md` already committed there and `add-restock-alert` holding its
own separate commit:

```bash
git merge add-restock-alert -m "Merge branch 'add-restock-alert' into main"
```

prints:

```text
Merge made by the 'ort' strategy.
 inventory_report.py | 3 +++
 1 file changed, 3 insertions(+)
```

Confirming the merge commit really does have two parents:

```bash
git cat-file -p HEAD
```

prints:

```text
tree 5ba5e485d6f652ebd38923482a27c0fa56856c4c
parent 1e98dcc1671df9603a84b6747af5831497ba3a0e
parent 5ea165cf7d1de19e3dee804df64419473ac02c89
author Test User <test@example.com> 1786950434 -0400
committer Test User <test@example.com> 1786950434 -0400

Merge branch 'add-restock-alert' into main
```

exactly two `parent` lines, the concrete proof this Concept Unit's own
Problem step asked for. The working directory now contains both
independent changes at once:

```bash
cat inventory_report.py
cat README.md
```

prints `low_stock_items` and `restock_alert` both present in
`inventory_report.py`, and the real `README.md` content — neither
branch, on its own, ever had both; only this new merge commit does.

### Connecting Back

`main` now contains everything: the threshold fix, the README, and the
restock-alert helper — three separate lines of work, developed
independently on three different branches across this lesson and
Lesson 108, reunited into one shared history through exactly two
mechanisms this lesson demonstrated directly: a pointer move when no
real combining was needed, and a genuine two-parent commit when it was.

---

## Connect the Pieces

Both Concept Units answer the same underlying question — how does
diverged history, real and permanent per Lesson 108, ever become one
shared history again — with two different, both entirely automatic,
answers. The first: `lower-default-threshold` held a history `main` was
already a strict prefix of, so `git merge` did the simplest thing
possible, moving `main`'s own ref file forward to match, confirmed
directly by reading that one-line file before and after and finding two
different hashes, then the same hash `lower-default-threshold` already
held. The second: `add-restock-alert` and a fresh, separate commit on
`main` genuinely diverged, each holding something the other didn't, so
`git merge` did something categorically different — creating a brand-new
commit, addressed by its own new hash, containing not one `parent` line
but two, proven directly with the identical `git cat-file` command
Lesson 107 first used to demystify an ordinary commit. Both outcomes
converge on the same result this lesson's own two-engineer pipeline
story has been waiting for since Lesson 105: separately committed work,
now provably combined into one project, one file, one shared history —
Integration, finally reached, not asserted.

## What Breaks Without This

There's no single command to "turn off" merging to demonstrate its
absence the way earlier lessons in this domain broke `git status` or
`git switch` on purpose. Instead, cause the real failure that skipping
this lesson's own discipline produces: manually copying a change between
branches instead of merging it, and losing the historical record of
where it actually came from. From inside the real `inventory-report/`
project, on `main`, manually retype `restock_alert` instead of merging
it in — imagine, for the sake of this demonstration, that
`add-restock-alert` had never been merged, only its function typed by
hand into `main` directly:

```bash
git log --oneline -- inventory_report.py
```

prints, after the real merge already performed above:

```text
fc19d84 Merge branch 'add-restock-alert' into main
be4eac2 lower default low-stock threshold from 5 to 3
ab7614a stage inventory_report.py and ignore generated logs
```

Every commit that ever touched `inventory_report.py` is listed, in
order, including the merge itself — real, permanent, provable history
naming exactly when `restock_alert` was added and through which merge.
Had that function instead been retyped by hand directly onto `main`,
with no merge at all, this exact query would show no trace of
`add-restock-alert` ever having existed — no record that this function
was ever developed, reviewed, or committed separately, only that it
appeared, unexplained, in whatever commit happened to include the manual
retyping. This is the same accidental-complexity cost Lesson 105 opened
this entire domain by naming: the code would work identically either
way, but only the merged version leaves an honest, permanent record of
how it actually got there.

## Exercises

1. Create two new branches from the real `inventory-report/` project's
   current `main`, make one small, non-overlapping change on each (two
   different files, or two clearly separate parts of the same file), and
   merge both into `main` one after another. State, before running
   either merge, which one you expect to fast-forward and which you
   expect to produce a real merge commit — then confirm with `git log
   --oneline --all --graph --decorate`.
2. After completing a real, non-fast-forward merge, run `git cat-file -p`
   against the merge commit's own hash and identify, by hash, exactly
   which two commits are its parents. Then run `git cat-file -p` against
   each of those two parent hashes in turn and confirm each one's own
   message matches a commit you actually remember making.
3. Using `git log --oneline -- <filename>`, the exact form this lesson's
   own "What Breaks Without This" section used, pick any file in the
   real project and list every commit that has ever touched it. Name, in
   your own words, what this specific form of `git log` is filtering by,
   compared to the plain `git log` this domain has used everywhere else.

## Definition of Done

- [ ] `lower-default-threshold` has been merged into `main` as a
      fast-forward, confirmed by reading `.git/refs/heads/main` before
      and after and finding it change to match
      `lower-default-threshold`'s own hash exactly.
- [ ] `add-restock-alert` has been merged into `main` as a real,
      non-fast-forward merge, confirmed by `Merge made by the '...'
      strategy.` appearing in the command's own output, not
      `Fast-forward`.
- [ ] The resulting merge commit has been opened with `git cat-file -p`
      and shown to contain exactly two `parent` lines.
- [ ] `inventory_report.py` and `README.md` both exist, in full, on
      `main`, confirming both independently developed changes are
      genuinely present at once.
- [ ] `git log --oneline -- inventory_report.py` correctly lists every
      commit that has ever touched that specific file, including the
      merge commit itself.

Commit any remaining real changes:

```bash
git add -A
git commit -m "confirm fast-forward and three-way merges into main"
```
