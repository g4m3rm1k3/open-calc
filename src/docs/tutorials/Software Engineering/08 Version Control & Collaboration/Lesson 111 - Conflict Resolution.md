# Lesson 111: Conflict Resolution

**What you will build.** The real failure Lessons 109 and 110 both
carefully avoided, faced head-on, twice: two branches, `threshold-to-2`
and `threshold-to-5`, each independently changing the exact same line of
`inventory_report.py` to a different value, merged into `main` on
purpose to trigger a genuine conflict — resolved by hand, completing a
real merge commit — and then the identical shape of collision reproduced
a second time during a rebase instead of a merge, resolved through a
different mechanism entirely. Every merge and rebase this domain has run
so far succeeded automatically because, by careful construction, no two
branches ever touched the same lines. That was never a general
guarantee — Lesson 109's own SE Lens already said so honestly — and this
lesson is where that guarantee finally runs out, on purpose, so the
failure can be met with real understanding instead of panic. The
transferable problem this lesson is actually about: a conflict is not
Git being broken, and not a sign anything was done wrong — it's Git
correctly refusing to guess between two changes that both look equally
legitimate to it, and handing that one genuinely human decision back to
a person.

**What you need to know first.** Lesson 109 (Merging) and Lesson 110
(Rebasing) both directly — this lesson assumes both mechanisms are
already understood in the case where they succeed automatically, and
spends its own three Concept Units on exactly the case where they can't:
a merge conflict (extending Lesson 109's own three-way merge), and a
rebase conflict (extending Lesson 110's own replay mechanism). This
lesson also reuses Lesson 105's `unified diff format` and `hunk` terms
in full, since a conflict's own markers, this lesson shows directly, are
built from the identical `-`/`+`/context-line vocabulary those terms
already named.

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

Still **Implementation** and **Integration** — and this lesson is the
first to show **Integration** honestly failing on its first attempt,
exactly the outcome Lesson 109's own header already flagged as a real
possibility it wasn't going to demonstrate. If Engineer A's
case-sensitivity fix and Engineer B's on-call logging addition, carried
since Lesson 105, had happened to touch the same line of
`is_username_available` — say, both rewriting its own comparison
expression, one to call `.lower()` on both sides, the other to add a
length check first — their merge would fail exactly the way this
lesson's own real branches do, for exactly the same reason: two
independently reasonable changes to the identical line, with nothing in
either commit alone stating which one should win. Resolving that isn't
a mechanical operation Git can perform correctly on someone's behalf —
it requires knowing, as a person, what the merged code is actually
supposed to do — which is precisely why this lesson's own two Concept
Units both end the same way: a human decision, typed by hand, not
generated.

**Terms used in this lesson.**

- **merge conflict** — the state Git enters when combining two branches
  and finding at least one place where both branches changed the same
  lines of the same file in different ways, with no way to automatically
  determine which change — or what combination of the two — is correct.
  It exists as the honest alternative to Git silently guessing: rather
  than picking one side arbitrarily, or attempting some best-effort
  blend that might be wrong in a way nobody notices, Git stops and
  reports exactly where the ambiguity is.
- **conflict markers** — the literal text Git inserts directly into a
  conflicted file, marking exactly which lines came from which side:
  `<<<<<<<`, a divider `=======`, and `>>>>>>>`, each followed by a
  label naming which commit or branch that section came from. They
  exist so a person resolving the conflict can see both original
  versions, in place, in the actual file, rather than needing to
  reconstruct them from two separate diffs by hand.
- **resolving a conflict** — the act of editing a conflicted file by
  hand to remove the conflict markers and leave behind whichever final
  content is actually correct — one side, the other, some combination of
  both, or something new entirely — followed by telling Git the conflict
  is settled. It exists because this is the one step in this entire
  domain that fundamentally cannot be automated: it requires
  understanding what the code is supposed to do, not just what changed.
- **`git merge --abort`** — a way to cancel a merge that's currently
  stuck in a conflicted state, restoring the repository to exactly how
  it looked immediately before the merge was attempted, as if it had
  never been run. It exists as a safety valve — proof that starting a
  merge is not an irreversible commitment, even once a conflict has
  already appeared.
- **`git rebase --continue`** — the command that resumes a paused rebase
  once a conflict has been resolved and staged, distinct from `git
  commit`, which is what completes a paused *merge*. The distinction
  exists because a rebase, per Lesson 110, is replaying a whole sequence
  of commits one at a time — `--continue` tells Git to finish creating
  the current one and move on to the next, rather than treating the
  whole operation as done the way a single `git commit` would for a
  merge.

**Objects and methods used.**

- **`git merge`** (revisited, in its failing form)
  - *What it is:* the identical subcommand Lesson 109 already gave full
    treatment to; this lesson shows the second of its two possible
    outcomes — not `Fast-forward` and not `Merge made by the '...'
    strategy.`, but a real, reported conflict.
  - *Implementation:* on encountering lines both branches changed
    differently, `git merge` prints `CONFLICT (content): Merge conflict
    in <file>` for each affected file, writes conflict markers directly
    into that file's own working-directory content, leaves the merge
    paused (`git status` reports "You have unmerged paths"), and exits
    with a non-zero status.
  - *Its use:* this lesson runs it specifically expecting this outcome,
    on two branches deliberately constructed to collide.
- **`git rebase`** (revisited, in its failing form)
  - *What it is:* the identical subcommand Lesson 110 already gave full
    treatment to; this lesson shows its own conflicting case.
  - *Implementation:* while replaying a commit, if that commit's own
    change can't be cleanly applied to the new base, `git rebase` pauses
    at that specific commit — not the whole sequence — reports the
    conflict using the identical marker format `git merge` uses, and
    waits for either `git rebase --continue` (after resolving) or `git
    rebase --abort` (to cancel entirely and return to the pre-rebase
    state).
  - *Its use:* this lesson runs it against the identical shape of
    collision as its own first Concept Unit, specifically to contrast
    how the two mechanisms differ in how a conflict gets resolved once
    found.

---

## Concept Unit: A Real Merge Conflict

### The Problem

Two branches, created for exactly this purpose: `threshold-to-2` lowers
`low_stock_items`'s default threshold to 2; `threshold-to-5` raises it
to 5 — both starting from the identical line, both changing it, to two
different values. Merging the first into `main` is nothing new — Lesson
109 already covered this exact mechanical case. Merging the *second* one
afterward is where this lesson actually begins: `main` now holds
`threshold=2`, and `threshold-to-5` holds `threshold=5`, on the
identical line, with no shared ancestor version between them that's
still unchanged. What does `git merge` do when it has no unambiguous
answer?

### Project Change

- **Reference Source.** No reference counterpart — continuing this
  domain's own from-scratch running example.
- **Files affected.** `inventory_report.py`, edited independently on two
  branches.
- **Change type.** Modify — the same one line, two different values.
- **Location.** `low_stock_items`'s own function signature.
- **Dependencies.** `threshold-to-2`, already merged into `main`;
  `threshold-to-5`, still unmerged, both created from the same shared
  ancestor.

### The New Code

```bash
git switch main
git merge threshold-to-5
```

### The Updated Project

No enclosing code structure — a standalone command. What it produces is
directly visible in the file it touches: `inventory_report.py`'s own
first line, opened right after this command runs, no longer reads as
ordinary Python at all:

```python
<<<<<<< HEAD
def low_stock_items(inventory, threshold=2):
=======
def low_stock_items(inventory, threshold=5):
>>>>>>> threshold-to-5
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)
```

Everything below the conflict — the loop, the `return` — is completely
unaffected, present exactly once, because only the first line actually
differs between the two sides; a conflict only ever appears exactly
where two changes genuinely overlap, never across a whole file just
because *some* line in it conflicts.

### Isolating the Concept: The Smallest Possible Conflict

Before trusting this on the real project, prove the underlying mechanism
on the smallest possible throwaway example — two branches, each
changing a one-line file to a different value:

```bash
mkdir lab && cd lab
git init -q
git config user.name "Test User"
git config user.email "test@example.com"
printf 'apple\nbanana\n' > fruits.txt
git add fruits.txt
git commit -q -m "add fruits list"
git branch left
git branch right
git switch left
printf 'apple\ncherry\n' > fruits.txt
git commit -qam "left: banana to cherry"
git switch right
printf 'apple\ndate\n' > fruits.txt
git commit -qam "right: banana to date"
git switch left
git merge right
```

prints:

```text
Auto-merging fruits.txt
CONFLICT (content): Merge conflict in fruits.txt
Automatic merge failed; fix conflicts and then commit the result.
```

and `fruits.txt` itself now reads:

```text
apple
<<<<<<< HEAD
cherry
=======
date
>>>>>>> right
```

`apple`, unchanged by either branch, appears once, plainly, above the
conflict — proof the conflict is scoped to exactly the one line both
sides actually touched. This is called a **merge conflict**, this
lesson's own header term, seen here concretely for the first time.
Before discarding this lab, prove one more real fact: a conflicted merge
can be called off entirely.

```bash
git merge --abort
git status
cat fruits.txt
```

prints:

```text
On branch left
nothing to commit, working tree clean
apple
cherry
```

`fruits.txt` is back to exactly what it held before the merge was ever
attempted — `left`'s own original content, no trace of `right`'s
`date` or of any conflict marker. This `lab/` directory is discarded
now.

### Mechanical Walkthrough

Every distinct element of the real conflict shown above, in order:

- **`Auto-merging inventory_report.py`** — printed before the conflict
  itself, confirming Git attempted the identical automatic combination
  Lesson 109's own `ort` strategy performs on every merge — this line
  appears whether or not a conflict follows.
- **`CONFLICT (content): Merge conflict in inventory_report.py`** — the
  actual report: `(content)` specifically names the kind of conflict
  (a line-content collision, as opposed to, for instance, one branch
  deleting a file the other modified — a different conflict kind this
  lesson doesn't need to demonstrate separately).
- **`Automatic merge failed; fix conflicts and then commit the result.`**
  — states plainly what happens next: unlike every successful merge or
  fast-forward this domain has run so far, nothing has actually been
  committed yet; the merge is paused, waiting on a person.
- **`<<<<<<< HEAD`** — the first conflict marker, opening the section
  belonging to whichever commit was checked out when the merge started
  — `main`, holding `threshold=2` — labeled `HEAD` rather than by branch
  name, because `HEAD`, per Lesson 108's own full explanation, always
  names whatever is currently checked out.
- **`def low_stock_items(inventory, threshold=2):`** — `main`'s own
  version of this line, shown exactly as it exists there, with nothing
  altered.
- **`=======`** — the divider marker, separating the two sides with no
  label of its own — everything above it belongs to `HEAD`; everything
  below, up to the next marker, belongs to the branch being merged in.
- **`def low_stock_items(inventory, threshold=5):`** — `threshold-to-5`'s
  own version of the identical line.
- **`>>>>>>> threshold-to-5`** — the closing marker, labeled with the
  branch name this time, not `HEAD` — the asymmetry exists because
  `HEAD` is a single, constantly meaningful reference (per Lesson 108),
  while the *other* side of a merge is only ever the specific branch
  named in the `git merge` command, worth naming explicitly rather than
  some second generic label.

### CS Lens

A merge conflict is the concrete, real-world case of a **three-way diff**
finding no consistent resolution: comparing the common ancestor against
both branch tips (the identical three points Lesson 109's own `three-way
merge` term already named) and discovering both tips changed the
identical region in incompatible ways, with no rule for picking a winner
built into the comparison itself. Also recognized in: a database
handling two simultaneous, conflicting updates to the same row under
weak consistency guarantees (some systems detect and reject one, exactly
as Git refuses to guess here); two co-authors editing the same paragraph
of a shared document at the same time, where an honest collaborative
editor flags the collision rather than silently keeping only the last
save; and a compare-and-swap operation in concurrent programming, which
deliberately fails rather than overwrite a value that changed underneath
it since it was last read.

### SE Lens

The alternative — Git picking a side automatically, say, always
preferring whichever branch is currently checked out — would remove the
pause this lesson's own Concept Unit is built around, at a real,
concrete cost: silently discarding a change someone deliberately made,
with no report and no recovery path, purely because it happened to lose
an arbitrary tiebreak. That alternative isn't hypothetical caution — it
would reintroduce, silently and automatically, the exact failure mode
Lesson 105 opened this entire domain by naming: one person's real work
vanishing because someone else's copy happened to win. A conflict
report, however inconvenient in the moment, is strictly safer than a
silent, arbitrary choice — the real cost is entirely human: someone has
to stop and actually look, which `git merge --abort`'s own real,
demonstrated safety valve makes low-risk to do.

### Commands Needed

- **`git merge --abort`** — no separate installation, available only
  while a merge is actively paused in a conflicted state; run with no
  arguments.

### Run It

From inside the real `inventory-report/` project, on `main`, with
`threshold-to-2` already merged:

```bash
git merge threshold-to-5
```

prints:

```text
Auto-merging inventory_report.py
CONFLICT (content): Merge conflict in inventory_report.py
Automatic merge failed; fix conflicts and then commit the result.
```

exactly matching the isolated lab's own shape, confirmed here on the
real project. `git status`, run at this point, reports:

```text
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   inventory_report.py

no changes added to commit (use "git add" and/or "git commit -a")
```

`both modified:` — a status this domain hasn't shown before — states
plainly, in Git's own words, exactly the situation this Concept Unit's
own Problem step described: both sides changed this file, and Git needs
a person to say which changes should actually stand.

### Connecting Back

`inventory_report.py`, right now, contains real conflict markers instead
of valid Python — the merge is genuinely paused, not failed and not
silently resolved. The next Concept Unit does the one thing this
Concept Unit's own SE Lens already said can't be automated: makes the
actual decision, by hand.

---

## Concept Unit: Resolving the Conflict and Completing the Merge

### The Problem

Two numbers, both real, both committed deliberately: `threshold=2`,
tightening early warnings for high-value items; `threshold=5`, widening
them for earlier notice generally. Neither is a bug; neither is
obviously "more correct" than the other from the code alone — this is
exactly the judgment call Lesson 109's own SE Lens already said Git
can't make. Say the actual, real decision, informed by both original
motivations, is a middle value: `threshold=3`, keeping some of the
tightening `threshold-to-2` wanted without losing all of the earlier
warning `threshold-to-5` wanted.

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** `inventory_report.py`, currently holding conflict
  markers from the previous Concept Unit.
- **Change type.** Modify — replacing the conflicted region with a
  single, deliberately chosen resolution.
- **Location.** The exact `<<<<<<< HEAD` ... `>>>>>>> threshold-to-5`
  block the previous Concept Unit left behind.
- **Dependencies.** The paused merge from the previous Concept Unit.

### The New Code

```python
def low_stock_items(inventory, threshold=3):
```

### The Updated Project

Placed directly where the conflict markers were, replacing the entire
marked block — not added alongside it:

```python
def low_stock_items(inventory, threshold=3):  # ← replaces the whole <<<<<<</=======/>>>>>>> block
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)
```

Every marker — `<<<<<<< HEAD`, `=======`, `>>>>>>> threshold-to-5` — and
both of the original conflicting lines are gone; only the single, chosen
resolution remains. This is called **resolving the conflict**, this
lesson's own header term, and it's a genuinely manual edit — nothing
about typing `threshold=3` here is Git-assisted or auto-generated; it's
an ordinary text edit to an ordinary file, exactly as if no merge were
in progress at all.

### Isolating the Concept: Completing a Merge After Resolving

Before trusting this on the real project, complete the throwaway
`lab/`'s own conflict the same way, on the smallest possible example.
Since the previous Concept Unit's own isolated lab ended with `git merge
--abort`, reproduce the conflict once more first:

```bash
cd lab
git merge right
```

reproduces the identical conflict shown before. Resolve it by hand,
choosing `elderberry` as a real compromise between `cherry` and `date`:

```bash
printf 'apple\nelderberry\n' > fruits.txt
git status
```

prints:

```text
On branch left
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   fruits.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

the identical `both modified:` report as before — editing the file
doesn't, by itself, tell Git the conflict is resolved. That requires one
more explicit step:

```bash
git add fruits.txt
git commit -m "resolve fruit conflict: settle on elderberry"
git log --oneline
```

prints:

```text
a4b5c6d resolve fruit conflict: settle on elderberry
a3b4c5d right: banana to date
a1b2c3d left: banana to cherry
b9c8d7e add fruits list
```

A real merge commit, in the exact same shape Lesson 109 already taught
in full — this one simply required a person's own edit before it could
be created. This `lab/` directory is discarded now.

### Mechanical Walkthrough

Every distinct element of resolving and completing the real merge,
walked through against the real project's own values in the Run It step
below:

- **Editing `inventory_report.py` directly** — an ordinary file edit,
  using whatever editor or command a person normally uses; nothing about
  this step involves a special "conflict resolution mode" Git puts you
  into — the file is just a file, and the markers are just text inside
  it, until a person removes them.
- **`git add inventory_report.py`** — the identical `git add` Lesson 106
  already gave full treatment to, doing the identical thing it's always
  done: taking a snapshot of the file's current working-directory
  content. Its meaning during a paused merge is slightly different in
  effect, not in mechanism: staging a file that was previously listed
  under `both modified:` is specifically how a person tells Git "this
  file's conflict is resolved" — Git infers that meaning from context
  (a file with unmerged paths being staged), not from any different
  command.
- **`git commit -m "..."`** — the identical `git commit` Lesson 107
  already gave full treatment to. Run with no arguments (just `-m`) here
  specifically because every file's conflict has already been resolved
  and staged; had any file still held unresolved markers, `git commit`
  would refuse, reporting exactly which files still need attention.
  This commit becomes a genuine merge commit, with two parents, in
  exactly the structural shape Lesson 109's own third Concept Unit
  already proved with `git cat-file`.

### CS Lens

Requiring an explicit `git add` before a conflict counts as "resolved"
is a real instance of **confirming intent before committing an
irreversible action** — the same pattern recognized in a file deletion
dialog that requires clicking a separate confirm button rather than
deleting the instant the delete key is pressed, a payment form that
requires a distinct "confirm purchase" step after entering card details,
and a database transaction's explicit `COMMIT` statement, separate from
every individual `UPDATE` that led up to it — in every case, the system
deliberately keeps a window open between "the data now reflects what the
person did" and "this is now final," rather than collapsing the two
into one step.

### SE Lens

The alternative — treating any edit to a conflicted file as automatic
resolution, with no separate `git add` step — would remove one explicit
confirmation, at the cost of a real, easy-to-imagine mistake: opening
the file, reading both sides, getting interrupted, and later committing
a file that still contains half-considered edits or, worse, markers
never actually removed. Lesson 105's own honesty standard applies
directly here too: a commit containing literal `<<<<<<<` text isn't a
hypothetical failure mode — it's a real, common mistake in projects that
don't build in a deliberate pause, and this domain's own two-step
resolve-then-stage-then-commit sequence exists specifically to make that
mistake harder to make by accident.

### Commands Needed

None beyond `git add` and `git commit`, both already fully covered in
Lessons 106 and 107.

### Run It

From inside the real `inventory-report/` project, with the conflict
markers replaced by `threshold=3`:

```bash
git add inventory_report.py
git commit -m "resolve threshold conflict: settle on 3 as the agreed default"
```

prints:

```text
[main 229c09d] resolve threshold conflict: settle on 3 as the agreed default
```

Confirming this really is a merge commit, with two parents, using the
identical proof Lesson 109 already established:

```bash
git cat-file -p 229c09d
```

prints two `parent` lines — one naming `threshold-to-2`'s own tip, the
other naming `threshold-to-5`'s own tip — exactly the structural shape
every non-conflicting merge commit in this domain has already shown,
proving a conflicted merge, once resolved, produces a completely
ordinary merge commit with nothing about its own object format marking
it as having ever been conflicted at all.

### Connecting Back

`main` now holds `threshold=3` — neither original value, a real,
deliberate compromise, recorded in a real merge commit with both
original branches as its parents. Nothing about the merge commit itself
records that a conflict ever happened; that information lives only in
the commit message, if the person writing it chooses to say so. The
final Concept Unit reproduces the identical shape of collision one more
time, during a rebase instead of a merge, to show exactly where the
resolution mechanics diverge.

---

## Concept Unit: The Same Conflict During a Rebase

### The Problem

Merging isn't the only operation that can produce a conflict — Lesson
110 already established that rebasing replays commits by computing and
reapplying diffs, and a diff that can't be cleanly reapplied against a
new base is exactly as real a possibility as two merged branches
touching the same lines. Two new branches, constructed the same way as
this lesson's first Concept Unit: `widen-restock-target`, changing
`reorder_suggestion`'s own `target` parameter to `20`; a separate,
independent commit landing directly on `main`, changing the identical
parameter to `15`. Rebasing the first onto the second reproduces the
identical kind of collision — does resolving it work the same way?

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** `inventory_report.py`, `reorder_suggestion`'s own
  `target` parameter.
- **Change type.** Modify.
- **Location.** `reorder_suggestion`'s function signature.
- **Dependencies.** `widen-restock-target`, holding one commit
  (`target=20`); `main`, holding one independent commit (`target=15`) on
  the identical line.

### The New Code

```bash
git switch widen-restock-target
git rebase main
```

### The Updated Project

The conflict this produces, opened directly in `inventory_report.py`:

```python
<<<<<<< HEAD
def reorder_suggestion(inventory, threshold=3, target=15):
=======
def reorder_suggestion(inventory, threshold=3, target=20):
>>>>>>> 46958eb (widen restock target to 20 units)
```

Compare this carefully against the first Concept Unit's own merge
conflict: there, `<<<<<<< HEAD` labeled `main`'s own version, and
`>>>>>>>` labeled the incoming branch by name. Here, `<<<<<<< HEAD`
labels `target=15` — `main`'s own value again — but the closing marker
is labeled by commit hash and message, `46958eb (widen restock target
to 20 units)`, not by branch name at all.

### Isolating the Concept: Why the Rebase Conflict's Labels Differ

Before trusting this reading on the real project, prove the underlying
mechanism on the smallest possible throwaway example, building fresh
divergence on a discarded copy of this lesson's own already-discarded
`lab/` shape:

```bash
mkdir lab2 && cd lab2
git init -q
git config user.name "Test User"
git config user.email "test@example.com"
printf 'apple\nbanana\n' > fruits.txt
git add fruits.txt
git commit -q -m "add fruits list"
git branch mine
git switch mine
printf 'apple\nfig\n' > fruits.txt
git commit -qam "mine: banana to fig"
git switch main
printf 'apple\ngrape\n' > fruits.txt
git commit -qam "main: banana to grape"
git switch mine
git rebase main
```

prints a conflict; `fruits.txt` reads:

```text
apple
<<<<<<< HEAD
grape
=======
fig
>>>>>>> <mine's own commit hash> (mine: banana to fig)
```

`HEAD` labels `grape` — `main`'s own value — even though `mine` is the
branch actually checked out and the one whose history is being rewritten.
This is the direct, concrete reason: per Lesson 110's own full
explanation of what rebasing actually does, `git rebase main` first
moves `HEAD` to point directly at `main`'s own tip commit (a
"detached HEAD" state, checking out a specific commit rather than a
branch by name), then replays `mine`'s own commits one at a time on top
of that. During the replay, `HEAD` genuinely *is* sitting on `main`'s
own commit — the labeling isn't arbitrary; it's reporting exactly what's
true at that exact moment, mid-replay. This `lab2/` directory is
discarded now.

### Mechanical Walkthrough

Every distinct element of the real rebase conflict, contrasted directly
against the merge conflict from this lesson's own first Concept Unit:

- **`<<<<<<< HEAD` labeling `main`'s value** — as the isolated lab just
  proved, this is because a rebase temporarily checks out the new base
  commit directly, making `HEAD`, at the moment of conflict, genuinely
  point at `main`, not at `widen-restock-target` — a real, if
  initially surprising, consequence of Lesson 110's own "replay" term:
  each commit is individually reapplied against whatever `HEAD`
  currently is, one at a time.
- **`>>>>>>> 46958eb (widen restock target to 20 units)`** — labeled by
  commit hash and message instead of by branch name, because a rebase
  conflict happens while replaying one *specific commit*, not while
  combining one *whole branch* the way a merge conflict's `>>>>>>>
  threshold-to-5` did — there's no single branch name to attach to a
  conflict that's local to one commit in the middle of a longer replay
  sequence.
- **`git rebase --continue`**, run after resolving — distinct from `git
  commit`: a rebase, per Lesson 110, may be replaying several commits in
  sequence, and `--continue` specifically means "finish this one commit
  and move on to whichever comes next," rather than "the whole operation
  is now done." With only one commit being replayed here, this
  particular run happens to finish the entire rebase — but the command
  itself doesn't know that in advance; it always means "proceed to the
  next step, whatever that is."

### CS Lens

The labeling difference between a merge conflict and a rebase conflict
is a direct, visible consequence of two genuinely different algorithms
producing what looks, to a person reading the markers, like the
identical situation. A merge conflict's three-way comparison, per this
lesson's own first Concept Unit, treats both sides symmetrically — two
branches, compared against a shared ancestor. A rebase's replay, per
Lesson 110, is asymmetric by construction: one specific commit's own
diff, computed once, being reapplied against a moving target. The same
underlying comparison machinery (the identical diff/patch logic Lesson
105 first taught) produces different-looking output depending on which
of two genuinely different higher-level operations is driving it — a
real example of the same lower-level tool serving two different
higher-level purposes.

### SE Lens

The practical consequence of this difference is exactly what a person
resolving a rebase conflict needs to know, and what a person expecting a
merge conflict's own labeling would get backwards: during a rebase,
"my" change is the one below `=======`, labeled by commit, not the one
above it labeled `HEAD` — the reverse of what merge conflict labeling
trains a person to expect. This is a real, documented source of
confusion for engineers new to rebasing, and it's not a flaw in either
mechanism — both labelings are accurate descriptions of what's
genuinely true at the moment each conflict occurs; the cost is purely
that the two mechanisms, despite producing visually identical-looking
marker blocks, mean the two halves in reversed roles, and only actually
reading the labels, not just the shape, tells you which is which.

### Commands Needed

- **`git rebase --continue`** — no separate installation; run only while
  a rebase is actively paused, after resolving and staging every
  conflicted file.

### Run It

From inside the real `inventory-report/` project, on
`widen-restock-target`, mid-rebase:

```bash
git rebase main
```

prints the conflict shown above. Resolving it with a compromise value,
`target=18`:

```bash
git add inventory_report.py
git rebase --continue
```

prints:

```text
Successfully rebased and updated refs/heads/widen-restock-target.
```

Confirming the result with the identical `git cat-file` proof this
domain has used since Lesson 107:

```bash
git cat-file -p widen-restock-target
```

prints a single `parent` line, naming `main`'s own tip — not two, the
way this lesson's earlier merge commit showed — because a rebase, per
Lesson 110's own full explanation, never creates a two-parent commit at
all; it only ever creates ordinary, single-parent commits, replayed onto
a new base. The message, worth noting honestly, still reads `widen
restock target to 20 units` — the original commit's own message,
unchanged by the conflict resolution, even though the actual value
committed is `18`, not `20`. Git never rewrites a commit's message to
match a resolved conflict automatically; a person choosing to update it
to stay accurate is a separate, manual step this lesson's own example
didn't take.

### Connecting Back

The identical shape of collision — two independent changes to one
line — produced two visibly different-looking conflicts, resolved
through two different completion commands, for reasons this Concept
Unit traced directly back to how merging and rebasing, per Lessons 109
and 110, actually differ underneath. Both, in the end, required the
identical human step neither mechanism could substitute for: reading
both versions and deciding, by hand, what the code should actually say.

---

## Connect the Pieces

Two conflicts, deliberately constructed, both resolved, both proving the
identical underlying point from two different angles. The first, a merge
conflict between `threshold-to-2` and `threshold-to-5`, showed conflict
markers labeled symmetrically by `HEAD` and by branch name, resolved by
editing the file directly, staging it, and completing an ordinary `git
commit` — which, opened with the same `git cat-file` proof Lesson 109
first established, turned out to be a completely ordinary two-parent
merge commit, with nothing in its own object format distinguishing it
from any conflict-free merge this domain has already made. The second,
a rebase conflict between `widen-restock-target` and an independent
change on `main`, showed the identical marker shape with its labels
reversed — `HEAD` naming the base being replayed onto, the closing
marker naming the specific commit being replayed by hash rather than
branch — resolved not with `git commit` but with `git rebase
--continue`, producing an ordinary single-parent commit instead of a
two-parent one. Both conflicts were real, both were caused on purpose by
constructing genuinely overlapping changes, and both were resolved the
one way this whole lesson insists neither Git nor this curriculum can
shortcut: a person, reading both sides, typing the actual answer by
hand.

## What Breaks Without This

There's no separate command to disable conflict detection to prove its
absence the way earlier lessons broke `git status` or `git switch` on
purpose — conflict detection isn't optional, and that's exactly the
point worth proving concretely instead: attempt to commit a file that
still contains unresolved conflict markers, skipping the "read and
decide" step this lesson's whole point has been. From inside the real
`inventory-report/` project, reproduce a fresh conflict and try to
commit past it without actually resolving anything:

```bash
git merge threshold-to-5
git commit -m "resolve conflict"
```

prints:

```text
error: Committing is not possible because you have unmerged files.
hint: Fix them up in the work tree, and then use 'git add/rm <file>'
hint: as appropriate to mark resolution and make a commit.
fatal: Exiting because of an unresolved conflict.
U	inventory_report.py
```

`U` — for **u**nmerged — is Git's own single-letter status code, printed
once per file still holding an unresolved conflict, naming exactly which
file `git commit` refused to proceed past. The command exits with a
non-zero status — Git refuses outright, regardless of
what message is supplied, because per the second Concept Unit's own
Mechanical Walkthrough, `git commit` specifically checks that every
previously conflicted file has actually been staged, and none of them
have been here. This is the concrete guarantee underneath this entire
lesson: it is not possible to accidentally commit a file still
containing raw `<<<<<<<` markers by simply forgetting to resolve them
and committing anyway — the one honest exception is a person manually
staging a file that still contains markers as literal text, believing
it's already fixed, which no `git status` check can catch, because at
that point it looks, to Git, exactly like a deliberate, resolved edit.
Abort this attempt and confirm the repository returns to a clean state,
using the identical safety valve the first Concept Unit already proved:

```bash
git merge --abort
git status
```

prints a clean working tree, with `threshold-to-5` still unmerged,
exactly as it was before this section's own demonstration began.

## Exercises

1. Reproduce this lesson's own first conflict yourself, on a throwaway
   repository: two branches changing the same line differently. Before
   resolving it, run `git diff` (no arguments) inside the conflicted
   state and describe, in your own words, what it shows compared to an
   ordinary unstaged-changes diff from Lesson 106.
2. Construct a conflict involving three lines changed on both sides,
   not just one, in a single file. Confirm the conflict markers appear
   around all three lines as one combined block (a single hunk) rather
   than three separate marker blocks, and explain why, referencing
   Lesson 105's own `hunk` term.
3. Reproduce this lesson's own rebase conflict, but this time abort it
   with `git rebase --abort` instead of resolving it. Run `git log
   --oneline` immediately afterward and confirm the branch is back to
   its original, pre-rebase commit — the same safety-valve guarantee
   this lesson's first Concept Unit already proved for `git merge
   --abort`, now confirmed for rebasing too.

## Definition of Done

- [ ] A real merge conflict has been produced on purpose, between
      `threshold-to-2` and `threshold-to-5`, and resolved by hand into a
      real merge commit, confirmed with `git cat-file -p` showing two
      parents.
- [ ] A real rebase conflict has been produced on purpose, and resolved
      with `git add` followed by `git rebase --continue`, confirmed with
      `git cat-file -p` showing exactly one parent.
- [ ] You can state, without looking anything up, which side of a merge
      conflict's markers is labeled `HEAD` versus by branch name, and
      which side of a rebase conflict's markers is labeled `HEAD` versus
      by commit hash — and why the two differ.
- [ ] `git merge --abort` and `git rebase --abort` have both been used
      at least once, each confirmed to restore the repository to exactly
      its pre-operation state.
- [ ] The refusal to commit an unresolved conflict has been reproduced
      on purpose and its exact error message read in full.

Commit the real, final state:

```bash
git add -A
git commit -m "resolve merge and rebase conflicts on threshold and restock target"
```
