# Lesson 106: Versioned State

**What you will build.** The real `inventory-report/` project, left at the
end of the previous lesson as one file Git could see but had never been
told to track, moved forward through the two states that sit between
"Git doesn't know this file exists" and "this file is part of the
project's permanent history": staged, and — deliberately, honestly — not
yet committed, because committing is next lesson's own subject. Along the
way, `inventory_report.py` gets edited a second time after already being
staged once, on purpose, so you can watch a real, common misconception
break: that telling Git about a file once means Git is now watching it
live. It isn't. The transferable problem this lesson is actually about:
a file tracked by Git doesn't have one version at any given moment — it
can have up to three, simultaneously, each one a different question's
answer ("what's on disk right now," "what will be committed if I commit
this second," and "what was last actually recorded"), and every Git
command this domain teaches from here on only makes sense once those
three are kept straight.

**What you need to know first.** Lesson 105 (Why Version Control Exists)
directly — this lesson picks up exactly where that one's own closing
Definition of Done left `inventory-report/`: a real Git repository,
containing one file, `inventory_report.py`, reported by `git status` as
untracked. This lesson also reuses that lesson's own `git status` and
`unified diff format` terms in full, restated here rather than cited, per
this curriculum's own Repetition Rule.

**Pipeline diagram.** Restated in full, as every lesson touching a named
pipeline stage does:

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

This lesson continues at the same two stages the previous lesson opened
at, **Implementation** and **Integration**, extending the identical
concrete example one step further. Lesson 105 imagined two engineers —
Engineer A, independently fixing the case-sensitivity gap Lesson 12 named
in `is_username_available` (does `"Dave"` collide with `"dave"`?), and
Engineer B, independently adding the on-call logging Lesson 12's own
3 a.m. story implied someone eventually had to write — both editing the
same function, `accounts.py`, at the same time. This lesson places both
engineers at the exact point this lesson's own real project just reached:
each of them, independently, has run `git add` on their own local copy of
`accounts.py`, moving their own fix into their own staging area. Neither
one has committed yet, and — critically, for the stage this lesson sits
at — neither one's staged change is visible to the other at all. Staging
a change is still entirely local, private work; **Integration**, the
stage where these two changes actually have to meet, doesn't begin until
something is shared between them, which is not what this lesson's own
commands do yet.

**Terms used in this lesson.**

- **the three trees** — the informal name for the three separate places a
  version-controlled file's content can independently sit at any given
  moment: the **working directory** (the file exactly as it sits on
  disk), the **staging area** (a snapshot of what will be included the
  next time a commit is made), and, once at least one commit exists, the
  **repository** or `HEAD` (the content of the most recent commit). It
  exists because these three can genuinely disagree with each other at
  the same time, and every command this lesson introduces exists to
  compare exactly two of the three.
- **staging area** (also called the **index**) — the second of the three
  trees: a holding area, separate from both the working directory and
  the repository's recorded history, where changes wait after being
  told to Git (`git add`) but before being permanently recorded (`git
  commit`, Lesson 107). It exists specifically so a commit can include
  only some of the changes currently sitting in the working directory,
  chosen deliberately, rather than being forced to record every current
  edit at once.
- **snapshot** — a complete copy of a file's content at one specific
  moment, independent of whatever the file's content becomes afterward.
  The term matters here because staging takes a snapshot, not a live
  reference: once `git add` runs, the staging area holds an exact copy
  of the file as it was at that instant, and further edits to the
  working directory do not change that copy until `git add` is told to
  take a new one.
- **working tree vs. index vs. HEAD, as a comparison target** — three
  different git commands exist because there are three different
  meaningful pairs to compare among these trees: working tree against
  index (plain `git diff`), index against `HEAD` (`git diff --staged`),
  and working tree against `HEAD` directly (not covered by name in this
  lesson, though `git status`'s own combined report effectively shows
  both halves of it at once).
- **ignored file** — a file Git has been explicitly told never to track,
  regardless of whether it's ever staged, via a `.gitignore` file. It
  exists because not everything sitting in a project's working directory
  belongs in its permanent history — generated files, logs, and
  machine-specific artifacts are common examples — and repeatedly seeing
  those files listed as untracked in `git status` output, lesson after
  lesson, would bury the files that actually matter.

**Objects and methods used.**

- **`git add`** (this lesson's own subject)
  - *What it is:* the Git subcommand that takes a snapshot of a file's
    current working-directory content and places that snapshot into the
    staging area.
  - *Implementation:* `git add <file>`, where `<file>` names one specific
    file (or a pattern matching several). It has no meaningful return
    value printed on success — it prints nothing at all when it works —
    and its effect is entirely visible only by checking `git status`
    or `git diff --staged` afterward.
  - *Its use:* this lesson runs it twice against the same file, at two
    different moments, specifically to prove that each run captures a
    fresh, independent snapshot rather than establishing an ongoing
    link.
- **`git diff`** (no arguments)
  - *What it is:* the Git subcommand that compares the working directory
    against the staging area and prints the difference in unified diff
    format — the identical notation Lesson 105 already taught in full
    via the standalone `diff` program.
  - *Implementation:* `git diff`, with no arguments, prints nothing at
    all (exits successfully with empty output) when the working
    directory and staging area are identical for every tracked file;
    otherwise it prints one unified-diff-formatted block per file that
    differs between the two.
  - *Its use:* this lesson runs it specifically after editing a file a
    second time, after already staging it once, to show precisely what
    changed since that snapshot was taken.
- **`git diff --staged`**
  - *What it is:* the same `git diff` subcommand as above, with the
    `--staged` flag, comparing a different pair of trees: the staging
    area against `HEAD` (the most recent commit) instead of the working
    directory against the staging area.
  - *Implementation:* `git diff --staged`, with no other arguments.
    Before any commit exists, `HEAD` has no content at all to compare
    against, so every staged file is shown as if newly added in full —
    exactly what this lesson's own Run It step below shows and explains.
  - *Its use:* this lesson runs it to answer a different question than
    plain `git diff` answers: not "what have I changed since I last
    staged," but "what will actually be recorded if I commit right now."
- **`.gitignore`**
  - *What it is:* not a Git subcommand — a plain text file, itself part
    of a project, that Git reads automatically and treats as a list of
    patterns to exclude from tracking entirely.
  - *Implementation:* one pattern per line; a line like `*.log` matches
    any file ending in `.log`, anywhere Git would otherwise be looking
    for files to report as untracked. A file matching a pattern in
    `.gitignore` is never listed by plain `git status`, never staged by
    a bare `git add .`, and never accidentally committed by either.
  - *Its use:* this lesson creates one to hide a generated log file from
    every `git status` report from this point in the project forward.

---

## Concept Unit: Staging a File

### The Problem

Lesson 105 ended with `inventory_report.py` reported by `git status` as
untracked — visible to Git, but not part of anything Git has recorded.
Nothing about that state lets you choose, deliberately, what will happen
to this file next. Somewhere between "Git can see it" and "Git has
permanently recorded it," there has to be a step where you actually
decide this file is ready — a real, distinct moment, not something that
happens automatically the instant a file is saved to disk.

### Project Change

- **Reference Source.** No reference counterpart — continuing this
  domain's own from-scratch running example.
- **Files affected.** `inventory_report.py`, already created in Lesson
  105; no new files.
- **Change type.** Configure — no line of the file's own content
  changes; only Git's internal record of the file's status changes.
- **Location.** Run from inside `inventory-report/`, the same repository
  Lesson 105 created.
- **Dependencies.** The `inventory-report/` repository from Lesson 105,
  currently containing `inventory_report.py` as an untracked file.

### The New Code

```bash
git add inventory_report.py
```

### The Updated Project

As with every Git subcommand so far, there's no code fragment being
inserted into a larger structure — this is a standalone command changing
Git's internal bookkeeping, not a line added to any file. What changes
is `inventory_report.py`'s own reported status, which the Run It step
below shows directly.

### Isolating the Concept: A File Before and After `git add`

Before trusting what `git add` did to the real project, watch it happen
on the smallest possible throwaway example — one file, in a fresh
repository unrelated to `inventory-report/`:

```bash
mkdir lab && cd lab
git init -q
printf 'apple\nbanana\n' > fruits.txt
git status
git add fruits.txt
git status
```

The first `git status` (before `git add`) prints:

```text
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	fruits.txt

nothing added to commit but untracked files present (use "git add" to track)
```

exactly the untracked report Lesson 105 already explained in full. The
second `git status`, run immediately after `git add fruits.txt`, prints
something structurally different:

```text
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   fruits.txt

```

The file moved from a section headed `Untracked files:` to one headed
`Changes to be committed:` — this is called **staging** a file, and it's
the one and only thing `git add` did: it took a snapshot of `fruits.txt`
exactly as it existed on disk at that moment and placed that snapshot
into the staging area, without touching the working-directory file
itself at all. This `lab/` directory is discarded now; the real
`inventory-report/` project, staged next with the identical command,
picks up from here.

### Mechanical Walkthrough

Every distinct element of `git add inventory_report.py`, and the status
report it produces, in order:

- **`git`** — the same single external program every command in this
  domain runs through.
- **`add`** — the subcommand selecting the staging behavior specifically,
  distinct from `init` (creates a repository) and `status` (reports
  state without changing it) already covered in Lesson 105 — `add` is
  this domain's first subcommand so far that actually changes something
  about how Git is tracking a file, rather than only creating a
  repository or reading its state.
- **`inventory_report.py`** — the positional argument naming exactly
  which file to stage. Without an argument, `git add` has nothing to
  act on and does nothing; it never stages "whatever changed" by
  default the way some tools guess at intent — it requires being told,
  by name, which file.
- **`Changes to be committed:`** — the new section header `git status`
  prints once at least one file has been staged, replacing or joining
  the `Untracked files:` header from before. It names, precisely, what
  the *next* `git commit` would actually record if run right now — not
  what exists on disk in general, only what's been explicitly staged.
- **`(use "git rm --cached <file>..." to unstage)`** — a hint line,
  naming the specific command that reverses staging: `git rm --cached`
  removes a file from the staging area — moving it back to untracked, or
  back to "matches the last commit" if one already existed — without
  deleting the working-directory file itself. This lesson doesn't run
  it, but the hint's own wording already answers the natural next
  question a reader would have ("how do I undo this?") honestly, the
  moment it comes up.
- **`new file:   inventory_report.py`** — the actual staged entry: `new
  file` because this is the first time this specific file has ever been
  staged in this repository (no commit exists yet that already contains
  a prior version of it); a file staged again later, after already being
  committed once, would instead be reported as `modified`, not `new
  file` — a distinction Lesson 107 (Commits) puts to direct use.

### CS Lens

The staging area is a real example of a **buffer**: a temporary holding
area that decouples the moment data is produced from the moment it's
consumed. Editing `inventory_report.py` produces a new version of the
file; staging it copies that version into the buffer; nothing consumes
that buffered copy until a commit happens, which may be seconds or hours
later, or may never happen at all if the change is abandoned first.
Also recognized in: a network protocol's send buffer, decoupling the
moment an application writes data from the moment it actually leaves
over the wire; a printer's job queue, decoupling "documents sent to
print" from "pages actually printed"; a video player's playback buffer,
decoupling "data downloaded" from "frames actually shown"; and a
restaurant's order ticket rail, decoupling "order taken" from "food
actually cooked."

### SE Lens

The alternative Git could have chosen — and some older version control
systems genuinely did — is to skip staging entirely: every save to disk
either is or isn't automatically part of the next recorded version, with
no separate step to choose. That alternative removes one step, but at a
real cost this Concept Unit's own scenario is about to demonstrate
directly: no way to record *some* of your current changes without
recording *all* of them. If you've been mid-edit on two unrelated things
at once — one real fix, one half-finished experiment — a version control
system with no staging area forces an uncomfortable choice: commit the
experiment too, or don't record the finished fix yet either. The staging
area's real cost is the one this Concept Unit's Problem step didn't
mention: it's an extra concept and an extra step a beginner has to learn
and remember to use, and forgetting to stage a real change before
committing is a genuinely common, recoverable mistake this domain will
name directly once commits themselves are taught.

### Commands Needed

- **`git add`** — no separate installation; available the moment `git`
  itself is installed.

### Run It

From inside the real `inventory-report/` project:

```bash
git add inventory_report.py
git status
```

prints:

```text
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   inventory_report.py

```

exactly matching the isolated lab's own second `git status` above,
confirmed here on the real project this domain is building.

### Connecting Back

`inventory_report.py` is now staged — Git has taken a snapshot of it and
is holding that snapshot, ready to be recorded. The next Concept Unit
puts real pressure on the word "snapshot" specifically: what happens if
the working-directory file changes again *after* this snapshot was
taken?

---

## Concept Unit: Comparing the Working Directory to the Staging Area

### The Problem

`inventory_report.py`, as staged in the previous Concept Unit, still
returns an unsorted list from `low_stock_items`. Say you now decide the
output really should be sorted, and you edit the working-directory file
again — right now, after already running `git add` once. Does the
snapshot Git is holding update automatically to match? Or does staging a
file once mean something more permanent, more like a photograph than a
live video feed? Neither `git add` nor `git status`'s own wording from
the previous Concept Unit actually answers this — it has to be checked.

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** `inventory_report.py`, edited in place.
- **Change type.** Modify — replacing the final `return low` line.
- **Location.** Inside `low_stock_items`, in `inventory_report.py`,
  replacing its own last line.
- **Dependencies.** `inventory_report.py` already staged, per the
  previous Concept Unit.

### The New Code

The one line being changed:

```python
    return sorted(low)
```

### The Updated Project

Placed inside the function it belongs to, with the changed line marked,
this is the entire current state of `inventory_report.py` on disk —
staged content is a separate, invisible copy elsewhere, not shown by
opening this file in an editor:

```python
def low_stock_items(inventory, threshold=5):
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)  # ← changed from `return low`
```

The function's behavior changes as a whole: it now returns the low-stock
item names in alphabetical order rather than in whatever order the
`inventory` dictionary happened to iterate them in — a real, user-visible
difference for anyone reading the report this function produces, and
exactly the kind of change a person would want reflected the next time
this file is committed.

### Isolating the Concept: A Snapshot That Doesn't Follow the File

Before checking what this does to the real project, prove the underlying
claim — that staging takes a snapshot, not a live link — on the smallest
possible throwaway example, continuing directly from the previous
Concept Unit's own isolated lab so there's real staged content to test
against:

```bash
cd lab   # the same throwaway repo from the previous isolated lab, with fruits.txt already staged
printf 'apple\nblueberry\n' > fruits.txt
git diff
```

prints:

```text
diff --git a/fruits.txt b/fruits.txt
index <hash1>..<hash2> 100644
--- a/fruits.txt
+++ b/fruits.txt
@@ -1,2 +1,2 @@
 apple
-banana
+blueberry
```

This is exactly the same unified diff format Lesson 105 already taught
in full — a `---`/`+++` header, one `@@ ... @@` hunk, context lines, and
`-`/`+` lines — produced this time by `git diff` instead of the standalone
`diff` program, comparing the working directory's new content
(`blueberry`) against the staging area's old snapshot (`banana`), not
against the file's own previous version on disk. This is called a
**comparison against the index**, and it's the direct, concrete proof
that staging really did take a snapshot back when `git add` ran — if it
had instead created some kind of live link to the file, this diff would
be empty, because the working directory and the "linked" staging area
would always match. `lab/` and `fruits.txt` are discarded again now.

### Mechanical Walkthrough

Every distinct element of `git diff`'s real output against the actual
`inventory-report/` project, shown in full in the Run It step below,
walked through here against the structure the isolated lab already
established:

- **`git`** and **`diff`** — the same program, and a subcommand distinct
  from `git add` and `git status` already covered: `diff`, run with no
  arguments, specifically compares the working directory against the
  staging area, and only ever reports files where the two disagree.
- **`diff --git a/inventory_report.py b/inventory_report.py`** — Git's
  own diff header line, naming the file on both sides of the comparison;
  the `a/` and `b/` prefixes are Git's own convention for labeling "old
  side" and "new side," distinct from the plain filenames the standalone
  `diff` program used in Lesson 105.
- **`index <hash1>..<hash2> 100644`** — a line with no equivalent in
  Lesson 105's plain `diff` output: `<hash1>` and `<hash2>` are short
  forms of the internal identifiers Git assigns to each distinct version
  of this file's content (the mechanism behind this — how Git actually
  computes and uses these identifiers — is Lesson 107's own subject, once
  commits give them somewhere permanent to live); `100644` is a file-mode
  code meaning "an ordinary, non-executable file," present on every
  normal source file this domain works with.
- **`--- a/inventory_report.py`** / **`+++ b/inventory_report.py`** —
  the same `---`/`+++` header pairing Lesson 105 already explained in
  full, here labeling "the staging area's version" (`---`) against "the
  working directory's version" (`+++`).
- **`@@ -3,4 +3,4 @@`** — the hunk header, same meaning as Lesson 105
  already gave in full: starting at line 3, this hunk covers 4 lines of
  the old (staged) version, and starting at line 3, 4 lines of the new
  (working-directory) version.
- **The context, `-`, and `+` lines beneath it** — identical in meaning
  to Lesson 105's own explanation: unchanged lines prefixed with a
  space, the removed `return low` line prefixed `-`, the added `return
  sorted(low)` line prefixed `+`.

### CS Lens

This is the identical **edit-script** idea Lesson 105 already named in
full for the standalone `diff` program — the same underlying algorithm,
computing the same kind of minimal `-`/`+` representation — applied here
to a different pair of inputs: not two files on disk, but one file on
disk against one snapshot held in memory (or, more precisely, already
written into Git's own internal object store, covered directly in
Lesson 107). The algorithm doesn't care where its two inputs come from;
it only needs two sequences of lines to compare.

### SE Lens

The alternative to a dedicated `git diff` command is what the previous
Concept Unit's SE Lens already named as this whole feature's real cost:
staging is easy to forget about. Without a way to ask, directly, "what
have I changed since I last staged," a person would have to trust their
own memory of what they edited since the last `git add` — exactly the
same trust-your-memory failure Lesson 105's own `git status` Concept
Unit already named as a real, recurring risk. `git diff`'s specific value
here is narrower than `git status`'s: `git status` only says *that*
`inventory_report.py` has unstaged changes; `git diff` says *exactly
what those changes are*, at the same level of precision Lesson 105
already established diffing generally provides.

### Commands Needed

- **`git diff`** — no separate installation; run with no arguments from
  inside a repository containing at least one already-staged file with
  further working-directory edits, or it prints nothing at all.

### Run It

From inside the real `inventory-report/` project, immediately after
staging `inventory_report.py` and then editing it again to add
`sorted(...)`:

```bash
git diff
```

prints:

```text
diff --git a/inventory_report.py b/inventory_report.py
index ce4dd3e..3e94d88 100644
--- a/inventory_report.py
+++ b/inventory_report.py
@@ -3,4 +3,4 @@ def low_stock_items(inventory, threshold=5):
     for name, count in inventory.items():
         if count < threshold:
             low.append(name)
-    return low
+    return sorted(low)
```

The two hashes, `ce4dd3e` and `3e94d88`, will differ on any other
machine or any other run of this exact sequence of edits — they're
computed from the exact byte content of each version, which is real and
reproducible given identical input, but not meaningfully comparable
across different setups; what matters is that two different hashes
appear at all, proving Git is tracking these as two genuinely distinct
versions of the same file.

### Connecting Back

`git diff` just proved, on the real project, exactly what the isolated
lab predicted: the version staged a Concept Unit ago is frozen, unaware
of the edit just made. That leaves one more real question open — if you
ran `git commit` right now, which version would actually get recorded,
the old staged snapshot or the new edited one? The next Concept Unit
answers that directly, without yet using `git commit` itself.

---

## Concept Unit: Comparing the Staging Area to the Last Commit

### The Problem

`git diff` just answered "what have I changed since I last staged" — but
it deliberately says nothing about the staged snapshot itself. If a
commit happened right now, the sorted-output edit from the previous
Concept Unit would be left out entirely — only the old, unsorted
snapshot would be recorded, because that's what's actually sitting in
the staging area. Before committing anything, is there a way to see
*exactly* what's staged, independent of whatever the working directory
currently looks like?

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** None — read-only inspection, same as `git status`
  and plain `git diff` before it.
- **Change type.** N/A.
- **Location.** Run from inside `inventory-report/`.
- **Dependencies.** `inventory_report.py`, currently staged in its
  original, unsorted form (the sorted edit from the previous Concept
  Unit is still unstaged).

### The New Code

```bash
git diff --staged
```

### The Updated Project

No enclosing structure to return to — a read-only inspection command,
same as `git status` and plain `git diff`.

### Isolating the Concept: Staged Content, Compared Against Nothing

Continue the same throwaway `lab/` repository — `fruits.txt` is
currently staged with `banana`, and the working directory holds
`blueberry` (unstaged, per the previous Concept Unit's own lab):

```bash
cd lab
git diff --staged
```

prints:

```text
diff --git a/fruits.txt b/fruits.txt
new file mode 100644
index 0000000..<hash>
--- /dev/null
+++ b/fruits.txt
@@ -0,0 +1,2 @@
+apple
+banana
```

Notice this shows `banana`, not `blueberry` — the staged snapshot from
before the second edit, exactly as expected, since `--staged` deliberately
ignores the working directory entirely. Notice also `--- /dev/null`: this
repository has no commits yet, so there is nothing on the "old" side of
this comparison at all — `/dev/null`, the same "nothing" every line of
`fruits.txt` is being added against, is why every line in the hunk below
it is prefixed `+` and none are prefixed `-` or left as unmarked context.
This is called comparing the **index against `HEAD`** — here, an "empty"
`HEAD`, because no commit exists yet to give it real content. Once
Lesson 107 creates a first commit, this same command run again will
compare against that commit's real content instead of `/dev/null`. This
lab is discarded now.

### Mechanical Walkthrough

Every element of `git diff --staged`'s output that differs from plain
`git diff`'s output, walked through against the real project's own run
in the Run It step below:

- **`--staged`** — the flag selecting a different pair of trees to
  compare: index against `HEAD`, instead of plain `git diff`'s working
  directory against index. (`--cached` is an older, still-valid spelling
  of the identical flag; this lesson uses `--staged` throughout because
  its name states plainly which tree it's asking about.)
- **`new file mode 100644`** — present here and absent from plain `git
  diff`'s output against the same file, because from `HEAD`'s point of
  view (currently empty, no commits yet), this file doesn't exist at
  all yet — it's not a modification, it's a creation, exactly as `git
  status`'s own `new file:` label already said in the first Concept Unit
  above.
- **`--- /dev/null`** — the "old" side of the comparison, standing for
  "nothing" — the special filename Unix-family systems use to mean an
  empty input or a discarded output, reused here by Git's diff format to
  represent "this file did not exist on this side of the comparison at
  all."
- **The remainder** — the `+++`, `@@ ... @@`, and content lines follow
  exactly the same format Lesson 105 and the previous two Concept Units
  in this lesson already explained in full, with every content line
  prefixed `+` because, again, there is nothing on the old side to show
  any `-` or context lines against.

### CS Lens

`git diff --staged`, before any commit exists, is comparing against the
mathematical **empty set** — a real, well-defined concept, not an error
state or a special case Git is awkwardly working around. Treating "no
prior content" as a legitimate, comparable value (rather than something
that has to be checked for and handled separately) is the same design
choice recognized in a database query returning zero rows instead of
raising an error, an empty shopping cart still being a valid cart object
rather than `null`, and the mathematical convention that the sum of no
numbers at all is defined to be `0`, not undefined.

### SE Lens

The alternative would be for `git diff --staged` to simply refuse to run,
or print an error, before any commit exists — treating "nothing to
compare against yet" as an exceptional case rather than a normal one.
That alternative would cost exactly what this Concept Unit's own Run It
step is about to demonstrate as valuable: the ability to preview, in
full, precisely what a first-ever commit would contain, before making
it. Git chose to make "no `HEAD` yet" a legitimate, comparable state
instead of a special case requiring different commands — one command,
`git diff --staged`, works identically whether zero commits or a
thousand commits already exist.

### Commands Needed

- **`git diff --staged`** — no separate installation; the `--staged`
  flag is available the moment `git diff` itself is.

### Run It

From inside the real `inventory-report/` project, with
`inventory_report.py` staged in its original unsorted form and a
further, unstaged edit already sitting in the working directory from
the previous Concept Unit:

```bash
git diff --staged
```

prints:

```text
diff --git a/inventory_report.py b/inventory_report.py
new file mode 100644
index 0000000..ce4dd3e
--- /dev/null
+++ b/inventory_report.py
@@ -0,0 +1,6 @@
+def low_stock_items(inventory, threshold=5):
+    low = []
+    for name, count in inventory.items():
+        if count < threshold:
+            low.append(name)
+    return low
```

Every line is prefixed `+`, and the function's last line reads `return
low` — the original, unsorted version, exactly as staged in the first
Concept Unit of this lesson — not `return sorted(low)`, even though
that's what `inventory_report.py` currently contains on disk. This is
the concrete, real proof the Problem step above asked for: committing
right now would record the old version, silently leaving the sort fix
out, and `git diff --staged` is the command that would have caught this
before it happened.

### Connecting Back

Two different comparisons now exist side by side: plain `git diff`
showed what's changed since the last `git add`; `git diff --staged`
showed what's actually staged, independent of further edits. Between
them, they answer the question the Problem step of this whole lesson
opened with — exactly which of `inventory_report.py`'s up-to-three
simultaneous versions is which. Re-running `git add inventory_report.py`
one more time, now that the sort fix is a deliberate, wanted change,
brings the staging area up to date with the working directory again —
the same command from this lesson's first Concept Unit, run a second
time, taking a fresh snapshot rather than somehow "updating" the old
one.

---

## Concept Unit: Telling Git to Never Track a File

### The Problem

Running the real `low_stock_items` report script produces useful
output — but also, in a realistic version of this project, a log file
recording when the report last ran, for debugging purposes. That log
file lives in the same working directory as `inventory_report.py` and
will show up in `git status` the same way any other new file would: as
untracked, asking to be staged. It doesn't belong in the project's
history at all — it's generated fresh every run, is different on every
machine that runs it, and would clutter every future `git status` report
in this domain's lessons with a file nobody ever intends to commit. Is
there a way to tell Git, once, to stop asking about it?

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** A new file, `inventory_report.log`, simulating
  generated output; a new file, `.gitignore`, added to
  `inventory-report/`.
- **Change type.** Add — both are new files.
- **Location.** Both created directly inside `inventory-report/`,
  alongside `inventory_report.py`.
- **Dependencies.** None beyond the existing `inventory-report/`
  repository.

### The New Code

```text
*.log
```

### The Updated Project

`.gitignore` is itself a brand-new file with nothing surrounding it yet
to place this line inside — the entire file's content, right now, is
this one line. `inventory-report/`'s directory listing now shows three
files where Lesson 105 and the earlier Concept Units in this lesson
showed one:

```text
inventory-report/
├── .git/
├── .gitignore
├── inventory_report.log
└── inventory_report.py
```

`inventory_report.py`'s own content and status are unaffected by any of
this; `.gitignore`'s single line changes how Git reports on
`inventory_report.log` specifically, checked directly in the Run It step
below.

### Isolating the Concept: A Pattern That Hides a File From Status

Before trusting this on the real project, prove it on the smallest
possible throwaway example — one file that should be ignored, one
pattern that should ignore it, in a fresh repository:

```bash
mkdir lab && cd lab
git init -q
echo "debug output" > scratch.log
git status
echo "*.log" > .gitignore
git status
```

The first `git status`, before `.gitignore` exists, prints:

```text
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	scratch.log

nothing added to commit but untracked files present (use "git add" to track)
```

exactly the ordinary untracked report Lesson 105 already explained. The
second `git status`, run immediately after creating `.gitignore`,
prints:

```text
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.gitignore

nothing added to commit but untracked files present (use "git add" to track)
```

`scratch.log` is gone from the report entirely — not staged, not shown
as untracked, simply absent, as if it didn't exist from Git's point of
view — while `.gitignore` itself now appears as untracked, because
`.gitignore` is an ordinary file in every other respect and this lesson
hasn't told Git to ignore itself. This is called an **ignored file**, the
term this lesson's own header already defined in full. This `lab/`
directory is discarded now.

### Mechanical Walkthrough

Every distinct element of the real `.gitignore` file and its effect,
walked through against the real project's own Run It step below:

- **`*.log`** — a pattern, not a literal filename: `*` matches any
  sequence of characters, so this line matches `inventory_report.log`,
  `scratch.log`, or any other file ending in `.log`, anywhere directly
  inside the same directory as this `.gitignore` file (a pattern
  matching files in subdirectories too uses a different, slightly more
  specific syntax this lesson doesn't need and doesn't cover).
- **The file's own name, `.gitignore`** — not itself a Git subcommand or
  a piece of syntax; the name is a fixed, literal convention Git
  specifically looks for, by that exact filename, in a repository's own
  directory. A file with the identical content saved under any other
  name would have no effect at all.

### CS Lens

A `.gitignore` file is a real example of a **denylist** (also called a
blocklist): a set of patterns identifying what to exclude, with
everything else implicitly allowed by default. Also recognized in: an
email spam filter's blocked-senders list, a firewall's list of blocked
IP addresses, a web browser's list of blocked trackers, and a linter's
`// eslint-disable` style exclusion comments — each one describes what's
excluded rather than enumerating everything that's permitted, because
the excluded set is almost always far smaller than the permitted one.

### SE Lens

The alternative is doing nothing, and manually skipping generated files
every time `git add` is run — remembering, by hand, every single time,
never to stage `inventory_report.log`. That alternative's real cost is
identical in shape to every "trust your own memory" alternative this
domain has already named: it works exactly until the one time it
doesn't, and the consequence — a generated, machine-specific log file
permanently committed into shared project history — is exactly the kind
of small, avoidable mistake a `.gitignore` file removes the *possibility*
of, not just the inconvenience of.

### Commands Needed

None beyond creating an ordinary text file — no installation, no new
program.

### Run It

From inside the real `inventory-report/` project, after creating both
`inventory_report.log` and `.gitignore`:

```bash
git status
```

prints:

```text
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   inventory_report.py

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.gitignore
```

`inventory_report.log` does not appear anywhere in this report — not
staged, not untracked — exactly as the isolated lab predicted, on the
real project this time. `inventory_report.py` still shows as staged
(`new file:`, under `Changes to be committed:`), carried forward from
this lesson's first Concept Unit; `.gitignore` itself shows as untracked,
exactly as expected, since it hasn't been staged yet either.

### Connecting Back

`inventory-report/`'s working directory now contains exactly one file
Git is deliberately ignoring, one file staged and ready, and one new file
— `.gitignore` itself — still untracked. Every one of the three trees
this lesson's own header named is now demonstrably distinct and provably
inspectable: `git status` shows the overview, `git diff` shows working
against staged, `git diff --staged` shows staged against `HEAD`, and
`.gitignore` shows that "tracked at all" is itself a choice, not a
default every file is subject to.

---

## Connect the Pieces

Follow `inventory_report.py` through every state this lesson gave it, in
order. It began exactly where Lesson 105 left it: untracked, visible to
Git, recorded nowhere. `git add` took a snapshot of it and placed that
snapshot in the staging area — the first of the three trees this
lesson's own header named to hold a real, distinct copy of this file's
content. Editing the file again afterward, adding `sorted(...)`, proved
that snapshot was frozen, not live: `git diff` showed the gap between
the now-edited working directory and the still-old staged copy, in the
identical unified diff notation Lesson 105 already taught. `git diff
--staged` showed the same staged copy from a different angle — not
against the working directory, but against `HEAD`, which, with no commit
yet made, meant against nothing at all, `/dev/null`, a legitimate
comparison target in its own right. Re-staging brought the staged
snapshot back in sync with the sorted version. And `.gitignore`, added
last, proved that a fourth possible state exists alongside untracked,
staged, and committed: deliberately excluded, invisible to every report
this lesson ran. Four states, three real Git commands, and one file,
`inventory_report.py`, moved through all of them — still, honestly, not
yet committed anywhere permanent. That's exactly where Lesson 107 picks
up.

## What Breaks Without This

Cause, on purpose, the exact misconception this lesson's second Concept
Unit was built to correct: assuming that staging a file once means Git
is now tracking its live content. From inside the real
`inventory-report/` project, with `inventory_report.py` currently
staged with the sorted-output fix (per this lesson's own re-staging
above):

```bash
echo "# TODO: handle empty inventory dict" >> inventory_report.py
git diff --staged
```

prints:

```text
diff --git a/inventory_report.py b/inventory_report.py
new file mode 100644
index 0000000..3e94d88
--- /dev/null
+++ b/inventory_report.py
@@ -0,0 +1,6 @@
+def low_stock_items(inventory, threshold=5):
+    low = []
+    for name, count in inventory.items():
+        if count < threshold:
+            low.append(name)
+    return sorted(low)
```

No `# TODO` comment appears anywhere in this output — the staged
snapshot, taken before this new line was added, has no knowledge of it
at all, exactly as the second Concept Unit above proved once already. A
person who assumed `git add` meant "Git is now watching this file" would
expect the `TODO` comment to show up here, and it doesn't; if they went
on to commit right now, believing their `TODO` note was included, they
would discover — potentially much later — that it wasn't recorded at
all. Running `git add inventory_report.py` one more time restores the
correct, current state, exactly as the working `Concept Unit` sequence
above already showed.

## Exercises

1. In any Git repository on your own machine (a fresh one is fine),
   stage a file with `git add`, then edit that same file again without
   re-staging it. Run `git diff` and `git diff --staged` back to back
   and, in your own words, state exactly what question each one is
   actually answering — not just what each one prints.
2. Create a `.gitignore` file in a fresh repository containing the single
   line `*.tmp`. Create two files, `notes.tmp` and `notes.txt`, with any
   content. Run `git status` and confirm, by name, which of the two
   files appears and which doesn't — then explain, in one sentence, why
   the pattern in `.gitignore` produced that specific result.
3. Stage a file, then delete the staged copy from the staging area using
   the exact command this lesson's own `git status` output hinted at but
   never ran: `git rm --cached <file>`. Run `git status` immediately
   afterward and confirm the file is back to untracked — and confirm,
   separately, that the file still exists, unchanged, in your working
   directory the whole time.

## Definition of Done

- [ ] `inventory_report.py` has been staged, edited again, and
      re-staged, with `git diff` and `git diff --staged` both run at the
      point where the two disagreed, confirming each showed a different,
      correct comparison.
- [ ] A `.gitignore` file exists in `inventory-report/` containing
      `*.log`, and a real `.log` file created afterward is confirmed, via
      `git status`, to be excluded from every report.
- [ ] The staging-is-a-snapshot misconception has been reproduced on
      purpose (edit after staging, confirm `git diff --staged` doesn't
      show the new edit) and resolved by re-staging.
- [ ] `git status`, run right now, reports `inventory_report.py` as
      staged (`new file:`, under `Changes to be committed:`) and
      `.gitignore` as untracked.

Commit what exists so far. This will fail again, exactly as Lesson 105's
own closing attempt did, and for the same underlying reason — `git
commit`, the actual command that would make this succeed, still hasn't
been explained. That's deliberate: Lesson 107, Commits, is where it
finally is.

```bash
git commit -m "stage inventory_report.py and ignore generated logs"
```
