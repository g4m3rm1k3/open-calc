# Lesson 107: Commits

**What you will build.** The real, permanent first commit of
`inventory-report/` — the actual command, `git commit`, that every prior
lesson in this entire curriculum has ended its own Definition of Done by
invoking, finally run with an understanding of what it does underneath
that one-line confirmation message. You'll view the result with `git
log`, and then go one step further than most introductions to version
control bother to: open the commit itself with `git cat-file` and read
its literal, real internal structure — a pointer to a tree of files, a
pointer to whichever commit (if any) came before it, an author, and a
message — proving, concretely, that a commit is not a mysterious
protected object but an ordinary, inspectable piece of data sitting on
disk, addressed by a hash computed from its own exact content. The
transferable problem this lesson is actually about: the difference
between *staging* something (Lesson 106) and *committing* it is the
difference between a draft and a permanent, addressable historical
record — and that permanence, plus that address, is what every later
lesson in this domain (branching, merging, rebasing) is actually built
on top of.

**What you need to know first.** Lesson 106 (Versioned State) directly —
this lesson opens with `inventory-report/` exactly as that lesson's own
closing Definition of Done left it: `inventory_report.py` and
`.gitignore` both staged, `git status` reporting a clean staging area
ready to commit, and one specific command, `git commit -m "stage
inventory_report.py and ignore generated logs"`, already typed at that
lesson's close but deliberately failing, because `git commit` itself
hadn't been explained yet. This lesson also reuses Lesson 105's `.git`
directory / repository metadata store term and Lesson 106's staging area
and snapshot terms, both restated here in full rather than cited, per
this curriculum's own Repetition Rule.

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

This lesson continues at **Implementation** and **Integration**,
extending the same two-engineer example one further step. Engineer A
(the case-sensitivity fix to `is_username_available`) and Engineer B (the
on-call logging addition) each staged their own change in Lesson 106.
This lesson gives each of them something Lesson 106's own staging area
never provided: a permanent, addressable record of that specific change,
created the moment each of them runs `git commit`. That record is now
real and durable — it survives a machine restart, an accidental edit to
the working directory, anything short of the `.git` directory itself
being deleted — but it is still, honestly, only **Implementation**, not
yet **Integration**: each commit exists only inside its own author's own
local `.git` directory, on their own machine, completely invisible to
the other engineer. Nothing about `git commit` itself involves any other
person or any shared location at all — a fact this lesson's own
Concept Units prove directly, and a gap this domain doesn't start
closing until pull requests, Lesson 112.

**Terms used in this lesson.**

- **commit** — a permanent, named snapshot of an entire project's
  staged content at one specific moment, plus a message describing why,
  recorded into a repository's history and never silently altered or
  removed afterward. It exists because a staging area, per Lesson 106,
  is explicitly temporary and gets overwritten by the next `git add`;
  a commit is the mechanism that actually converts a temporary snapshot
  into a durable historical record.
- **commit hash (SHA-1)** — a fixed-length string of 40 hexadecimal
  characters, computed directly from a commit's own exact content, that
  serves as that commit's permanent, unique address. It exists because a
  repository's history isn't a numbered list — commits need some way to
  be referred to individually, and computing an address directly from a
  commit's own content (rather than assigning the next available number)
  guarantees two different commits can never accidentally share one.
- **content-addressable storage** — a storage scheme where an object's
  address is derived from its own content, rather than assigned
  separately (the way a file's path or a database row's ID normally is).
  It exists because it gives two independently useful guarantees for
  free: identical content always produces the identical address (so
  Git never has to store the same content twice), and any change to
  content — even one character — produces a completely different
  address (so a corrupted or tampered object is immediately detectable,
  because its content and its address would no longer match).
- **commit object, tree object, blob object** — the three kinds of
  objects Git actually stores inside `.git`'s own `objects/` directory
  (introduced by name, not yet opened, back in Lesson 105). A **blob**
  holds one file's raw content; a **tree** holds a directory listing —
  filenames, permissions, and which blob or sub-tree each name points
  to; a **commit** holds a pointer to one tree (the project's entire
  file structure at that moment), a pointer to the commit that came
  immediately before it (if any), an author, a timestamp, and a message.
  These three terms exist because "a commit" is not itself one flat
  blob of everything — it's a small object pointing to a tree, which
  itself points to the actual file contents, a structure this lesson's
  own isolated lab opens and reads directly.
- **parent commit** — the commit a given commit points to as the one
  that came immediately before it, forming a chain back through a
  project's entire history. The very first commit ever made in a
  repository has no parent at all — a real, distinct case this lesson's
  own commit is an example of.
- **commit message** — the human-written text describing why a specific
  commit was made, supplied at commit time and stored permanently as
  part of the commit object itself. It exists because a diff alone
  (Lessons 105 and 106) shows precisely *what* changed but nothing about
  *why* — and *why* is very often the harder, more valuable question to
  answer months later.

**Objects and methods used.**

- **`git commit`** (this lesson's own subject)
  - *What it is:* the Git subcommand that converts the current contents
    of the staging area into a new, permanent commit object.
  - *Implementation:* `git commit -m "<message>"`, where `-m` supplies
    the commit message directly on the command line (an alternative
    form, run as plain `git commit` with no `-m`, opens a text editor
    for the message instead — not used in this lesson, since it needs an
    interactive terminal this lesson's own transcripts can't show). On
    success it prints a one-line summary naming the branch, an
    abbreviated version of the new commit's hash, the message's first
    line, and a count of files and lines changed.
  - *Its use:* this lesson runs it once, against the exact staged
    content Lesson 106 left behind, to create `inventory-report/`'s
    first-ever commit.
- **`git log`**
  - *What it is:* the Git subcommand that lists a repository's commit
    history, most recent first.
  - *Implementation:* `git log`, with no arguments, prints each commit's
    full hash, author, date, and message; the `--oneline` flag condenses
    each commit to a single line — an abbreviated hash plus the
    message's first line — useful once a repository has more than a
    handful of commits to look through at once.
  - *Its use:* this lesson runs it to confirm the commit made moments
    earlier is really, permanently recorded, and to see, for the first
    time, what a repository's history actually looks like from the
    outside.
- **`git cat-file`**
  - *What it is:* a low-level Git subcommand ("plumbing," in Git's own
    terminology, as opposed to the "porcelain" commands like `commit`
    and `log` normal day-to-day work uses) that reads and prints the raw
    content of any object stored inside `.git`'s own `objects/`
    directory, given that object's hash.
  - *Implementation:* `git cat-file -t <hash>` prints the object's type
    (`commit`, `tree`, or `blob`); `git cat-file -p <hash>` prints the
    object's actual content, formatted for reading. Both require the
    object's hash — or a long enough unambiguous prefix of it — as an
    argument.
  - *Its use:* this lesson uses it specifically as demystification —
    proof that a commit is real, ordinary, inspectable data on disk, not
    a black box `git commit` manages in some inaccessible way.

---

## Concept Unit: Making the First Commit

### The Problem

Lesson 106 ended with `inventory_report.py` and `.gitignore` both
staged — snapshots of each file's content sitting in the staging area,
per that lesson's own full explanation of what staging actually is —
and one command, `git commit`, typed but not yet explained, failing not
because anything was wrong but because this exact moment, right here, is
where that command's real explanation begins. Staging alone still
doesn't answer the question every prior lesson's closing instruction
implied it would: how does a snapshot become a *permanent* part of this
project's history, safe from being silently overwritten by the next
`git add`?

### Project Change

- **Reference Source.** No reference counterpart — continuing this
  domain's own from-scratch running example.
- **Files affected.** None directly — this command acts on the staging
  area's already-existing content, established across Lesson 106; no
  working-directory file changes.
- **Change type.** Add — a brand-new commit object, the first one this
  repository has ever contained.
- **Location.** Run from inside `inventory-report/`.
- **Dependencies.** `inventory_report.py` and `.gitignore`, both staged,
  exactly as Lesson 106's own Definition of Done left them.

### The New Code

```bash
git commit -m "stage inventory_report.py and ignore generated logs"
```

### The Updated Project

No enclosing code structure to place this inside — like every other Git
subcommand in this domain so far, it's a standalone terminal invocation.
What it changes is the repository's own history, made visible directly
by `git log` in the next Concept Unit, and by `git status`, run
immediately after this command, reporting a genuinely new fact about the
project:

```text
On branch main
nothing to commit, working tree clean
```

This is a new message, never seen in this domain before Lesson 107 — every
prior `git status` run in Lessons 105 and 106 reported either untracked
files or staged changes; this is the first time this project has reached
a state where the working directory, the staging area, and the most
recent commit all agree completely.

### Isolating the Concept: A Commit, End to End

Before trusting this on the real project, watch the entire sequence —
stage, then commit, then check status — on the smallest possible
throwaway example:

```bash
mkdir lab && cd lab
git init -q
git config user.name "Test User"
git config user.email "test@example.com"
printf 'apple\nbanana\n' > fruits.txt
git add fruits.txt
git commit -m "add fruits list"
git status
```

Running this prints, for the `commit` line specifically:

```text
[main (root-commit) a1b2c3d] add fruits list
 1 file changed, 2 insertions(+)
 create mode 100644 fruits.txt
```

and the `status` line that follows prints:

```text
On branch main
nothing to commit, working tree clean
```

This confirms, on a throwaway example small enough to hold in your head
completely, exactly what the real project's own commit is about to
prove: a commit takes whatever is currently staged, seals it permanently
into the repository's history, and leaves the working directory,
staging area, and history all reporting the identical content. This is
called **committing**, and it's the one and only thing `git commit`
does — no file's own content changes as a result of it; only the
repository's permanent record does. This `lab/` directory is discarded
now.

### Mechanical Walkthrough

Every distinct element of `git commit`'s real invocation and output,
walked through against the real project's own run in the Run It step
below:

- **`git`** and **`commit`** — the same single external program every
  command in this domain runs through, and the subcommand selecting the
  behavior that converts staged content into a permanent record — the
  first subcommand in this domain that both reads the repository's
  current state (what's staged) and writes something genuinely new and
  permanent to it, distinct from `add` (writes, but only to the
  temporary staging area) and `status`/`diff`/`log` (read-only).
- **`-m`** — a flag supplying the commit message directly as a
  command-line argument, distinguished from running `git commit` with no
  `-m`, which instead opens a text editor for the message — a form not
  used in this lesson's own transcripts, since an interactively-edited
  message can't be shown as static text the way a `-m` argument can.
- **`"stage inventory_report.py and ignore generated logs"`** — the
  message itself: a string, quoted so the shell treats the spaces inside
  it as part of one single argument rather than as separators between
  several arguments. This specific message is honestly not a great one
  by this domain's own future standards — it describes what was staged,
  not why the change was made — a real, worth-noticing gap this lesson
  doesn't hide and a later lesson in this domain returns to directly.
- **`[main (root-commit) ...]`** — the first line of `git commit`'s own
  success output: `main` names the branch this commit was made on
  (flagged in Lesson 106, still not fully explained until Lesson 108);
  `root-commit` is a label Git prints only for a repository's very first
  commit specifically, because a root commit is a genuinely distinct
  case — it has no parent commit at all, a fact the isolated lab in the
  next Concept Unit inspects directly; the abbreviated hash that follows
  is the new commit's own address, explained in full in this lesson's
  third Concept Unit.
- **`2 files changed, 7 insertions(+)`** — a summary count: how many
  files this commit's snapshot differs from its parent by (or, for a
  root commit with no parent, simply how many files the commit contains
  in total), and how many lines were added versus removed across all of
  them — `insertions(+)` only, with no `deletions(-)` shown, because
  every line in both files is new in this, the first commit.
- **`create mode 100644 .gitignore` / `create mode 100644
  inventory_report.py`** — one line per file the commit newly creates,
  each naming the file's mode (`100644`, the same "ordinary,
  non-executable file" code Lesson 106 already explained in full) and
  its name.

### CS Lens

A commit that reaches a state matching both the working directory and
the staging area is an example of **convergence** — three independently
tracked pieces of state (working directory, staging area, `HEAD`) ending
up in agreement, checkable directly rather than assumed. Also recognized
in: a distributed database confirming a write has been replicated to
every node before reporting success, a spreadsheet's "saved" indicator
only lighting up once every pending edit has actually reached disk, and
a multiplayer game's client and server periodically reconciling state to
confirm neither has silently drifted from the other.

### SE Lens

The alternative this whole domain opened by rejecting, back in Lesson
105, was manual copies with hand-chosen names — `inventory_report_v2_
FINAL.py`. A commit is the same underlying need, "keep a permanent
record of this version," solved with a real address (the commit hash,
explained fully in this lesson's third Concept Unit) instead of a
human-chosen filename, and a real message field instead of whatever fit
in an email subject line. The real cost this Concept Unit doesn't
remove: a commit message is only as useful as what a person actually
writes into it, and this very commit's own message — noted honestly in
the Mechanical Walkthrough above — is a real example of a technically
correct but weak one. Git enforces that a message exists; it enforces
nothing at all about whether that message is any good.

### Commands Needed

- **`git commit`** — no separate installation; requires `git config
  user.name` and `git config user.email` to be set at least once per
  machine (or per repository) before the first commit — without them,
  `git commit` refuses to run and explains exactly what's missing.

### Run It

From inside the real `inventory-report/` project, with
`inventory_report.py` and `.gitignore` both staged exactly as Lesson 106
left them:

```bash
git commit -m "stage inventory_report.py and ignore generated logs"
```

prints:

```text
[main (root-commit) ab7614a] stage inventory_report.py and ignore generated logs
 2 files changed, 7 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 inventory_report.py
```

The abbreviated hash, `ab7614a`, will be different on any other machine
or any other run of this sequence — it depends on the exact author name,
email, and timestamp recorded alongside the commit, none of which are
identical from one person's terminal to the next. What matters, and
will match exactly, is the shape: `[main (root-commit) <some hash>]`,
followed by the message, followed by the file and line counts.

### Connecting Back

The exact command Lesson 106 ended on, and left deliberately failing,
just succeeded — the only thing that changed in between is that this
Concept Unit finally explained what it does. `inventory-report/` now has
one real, permanent commit. The next Concept Unit looks at that
commit from the outside, the way anyone opening this project later
would.

---

## Concept Unit: Viewing History

### The Problem

A commit that can't be seen again isn't meaningfully different from no
commit at all. Right now, the only evidence `inventory-report/` has a
commit is the one-line confirmation `git commit` printed a moment ago —
already scrolled past, in a real terminal. Is there a way to ask the
repository, at any later point, what its recorded history actually
contains?

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** None — read-only inspection.
- **Change type.** N/A.
- **Location.** Run from inside `inventory-report/`.
- **Dependencies.** The commit made in the previous Concept Unit.

### The New Code

```bash
git log
```

### The Updated Project

No enclosing structure — a standalone, read-only command, same as
`git status` and `git diff` before it.

### Isolating the Concept: A History of More Than One Commit

`git log` against a repository with exactly one commit doesn't yet show
what makes it genuinely useful — a real sequence. Continue the same
throwaway `lab/` repository from the previous Concept Unit and add a
second commit:

```bash
cd lab
printf 'apple\nblueberry\ncherry\n' > fruits.txt
git add fruits.txt
git commit -m "add cherry, fix banana typo to blueberry"
git log --oneline
```

prints:

```text
f4e5d6a add cherry, fix banana typo to blueberry
a1b2c3d add fruits list
```

Two lines, most recent commit first, each showing an abbreviated hash
and the message's first line. This is called the **commit history**, and
this is the smallest possible example of what makes it worth having at
all: a project's entire sequence of permanent, ordered snapshots,
readable at a glance, with `f4e5d6a`'s own commit object internally
pointing back at `a1b2c3d` as its parent — a chain this lesson's third
Concept Unit reads directly, not just describes. This `lab/` directory
is discarded now; the real `inventory-report/` project, checked next,
currently has only the one commit from the previous Concept Unit.

### Mechanical Walkthrough

Every distinct element of `git log`'s real output against the actual
`inventory-report/` project, shown in the Run It step below:

- **`git`** and **`log`** — the same program, and a subcommand distinct
  from every other one covered so far: `status` reports the working
  directory and staging area's current state; `log` reports the
  repository's permanent, ordered history of commits — a fundamentally
  different question, about the past rather than the present.
- **`commit ab7614a98b9d2fd58564c1dd354d3a5c5cddd736`** — the full,
  40-character commit hash, printed in full by plain `git log` (as
  opposed to the abbreviated 7-character form `git commit`'s own success
  message and `git log --oneline` both use) — explained in full in this
  lesson's next Concept Unit.
- **`Author: Test User <test@example.com>`** — the name and email
  recorded with this commit, taken from the `git config user.name` and
  `git config user.email` values set once per machine before committing
  — real values that will differ for every reader running this on their
  own machine and their own name, by design.
- **`Date:   <timestamp>`** — the exact moment the commit was made,
  recorded automatically; like the diff timestamps Lesson 105 already
  flagged, this value is expected to differ run to run and reader to
  reader, and that variation is not an error.
- **`    stage inventory_report.py and ignore generated logs`** — the
  commit message, indented, printed in full.

### CS Lens

A commit history, where each entry points back to exactly the one entry
that came before it, is a **linked list** — one of the most fundamental
data structures in computer science: a sequence of nodes where each node
holds data plus a reference to the next (here, the previous) node,
rather than being stored contiguously by position the way an array is.
Also recognized in: a browser's back button history, a text editor's
undo stack (again, the identical shape Lesson 105's own `.git` directory
CS Lens already named for a different reason — separated metadata — now
recognized a second time for its actual internal structure), a train's
individual cars each coupled only to the one immediately ahead of it,
and a family tree traced back through a single line of ancestry.

### SE Lens

The alternative — no `git log`, only `git status`'s narrow window into
the *current* moment — would leave a repository's own history
technically present (every commit object genuinely still exists on
disk, as the next Concept Unit proves directly) but practically
invisible, recoverable only by someone who already happens to know each
commit's exact hash. `git log`'s real value is turning a structure that
technically exists into one a person can actually navigate — the same
distinction this curriculum has already drawn between data existing
somewhere and a system actually surfacing it where the people who need
it can see it.

### Commands Needed

- **`git log`** — no separate installation; run with no arguments from
  inside any repository with at least one commit.

### Run It

From inside the real `inventory-report/` project:

```bash
git log
```

prints:

```text
commit ab7614a98b9d2fd58564c1dd354d3a5c5cddd736
Author: Test User <test@example.com>
Date:   Mon Aug 17 02:59:50 2026 -0400

    stage inventory_report.py and ignore generated logs
```

One entry, matching the one commit made so far — the exact hash,
author, date, and message will differ on any other machine this is run
on, for the same reasons the isolated lab above already named.

### Connecting Back

`git log` proved the commit made in the previous Concept Unit is really,
permanently recorded — visible again, on demand, long after the
terminal that originally showed `git commit`'s confirmation message has
scrolled past it. One thing `git log`'s own output leaves unexplained:
what that 40-character hash actually *is*, and why it's the right way to
address a commit at all rather than, say, a simple incrementing number.
The final Concept Unit answers that directly, by opening the commit
itself.

---

## Concept Unit: What a Commit Actually Is

### The Problem

`git log` printed a hash, an author, a date, and a message — but a
commit, per this lesson's own header, also supposedly contains "a
pointer to a tree of files" and "a pointer to its parent commit." Neither
of those appeared anywhere in `git log`'s own output. Is that description
accurate, or is "a commit points to a tree" just a convenient way of
talking about something that doesn't really work that way underneath?
This is exactly the kind of claim this curriculum's own schema refuses
to accept on faith — "the tool handles this internally" is not an
explanation, it's an assertion, and it needs the same kind of real proof
Lesson 105 already demanded of the `.git` directory itself.

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** None — read-only inspection of objects Git already
  created, back in the first Concept Unit's own `git commit`.
- **Change type.** N/A.
- **Location.** Run from inside `inventory-report/`.
- **Dependencies.** The commit made in this lesson's first Concept
  Unit, and its exact hash, `ab7614a98b9d2fd58564c1dd354d3a5c5cddd736`
  (or `ab7614a` abbreviated), read from `git log`'s own output in the
  previous Concept Unit.

### The New Code

```bash
git cat-file -p ab7614a98b9d2fd58564c1dd354d3a5c5cddd736
```

### The Updated Project

No enclosing structure — a direct, read-only inspection of one specific
object, identified by its own hash, stored somewhere inside
`inventory-report/.git/objects/`.

### Isolating the Concept: Opening a Commit From the Inside

Before reading the real project's own commit object, open the smallest
possible one — the throwaway `lab/` repository's own first commit,
`a1b2c3d`, from earlier in this lesson:

```bash
cd lab
git cat-file -t a1b2c3d
git cat-file -p a1b2c3d
```

`git cat-file -t` (type) prints:

```text
commit
```

confirming this hash really does address a commit object, not something
else. `git cat-file -p` (print) prints the object's actual content:

```text
tree 8f94139338f9404f26296befa88755fc2598c289
author Test User <test@example.com> 1786944000 -0400
committer Test User <test@example.com> 1786944000 -0400

add fruits list
```

This is called opening a **commit object**, and it directly settles the
Problem step's own question: a commit object really does contain a
`tree` line, pointing at a separate object by its own hash, and — because
this specific commit is a root commit, exactly as its `git commit`
output already labeled it — no `parent` line at all; a non-root commit's
object would show one additional line, `parent <hash of the previous
commit>`, right below the `tree` line. Notice, too, what's genuinely
absent: no file content, no filenames, nothing about `fruits.txt`
directly — only a pointer to a tree object, an author, a committer (the
same person here, though they can differ — someone applying another
person's already-authored change, for instance), and the message. This
`lab/` repository is now fully discarded, including this specific
commit; the real project's own commit, opened next, is where this
lesson's own running example continues.

### Mechanical Walkthrough

Every distinct element of the real commit object's content, and the two
objects it leads to, walked through in the order the Run It step below
actually reveals them:

- **`git cat-file -t <hash>`** — the type-checking form: given any
  object hash, prints only which of the three object kinds it is
  (`commit`, `tree`, or `blob`), with no other content.
- **`git cat-file -p <hash>`** — the content-printing form used for the
  rest of this walkthrough: given any object hash, prints that object's
  real stored content, formatted for human reading.
- **`tree <hash>`** — the commit object's first line: a pointer, by
  hash, to exactly one tree object — the complete snapshot of every
  file and directory this commit represents, at this exact point in the
  project's history.
- **`author <name> <email> <timestamp> <timezone>`** and **`committer
  <name> <email> <timestamp> <timezone>`** — two separate fields,
  identical here because the same person both wrote and committed this
  change; Git distinguishes them because that isn't always true (a
  maintainer can commit a patch someone else authored, preserving both
  facts).
- **The blank line, then the message** — the commit message itself,
  stored as the literal remainder of the object's content, exactly as
  typed after `-m`.
- **The tree object, opened next** — `git cat-file -p <tree hash>`
  prints one line per file: a mode (`100644`, already explained in
  Lesson 106), the literal word `blob` naming what kind of object that
  entry points to, that blob's own hash, and the filename. This is the
  directory listing the commit object's `tree` line pointed at — proof
  that a commit doesn't contain file content directly; it contains one
  pointer to a tree, which in turn contains pointers to blobs.
- **The blob object, opened last** — `git cat-file -p <blob hash>`
  prints exactly, byte for byte, `inventory_report.py`'s own content at
  the moment it was committed — nothing more, no filename, no metadata,
  just the raw file content itself, addressed by a hash computed
  directly from that exact content.

### CS Lens

The hash addressing every one of these objects — commit, tree, and
blob alike — is **SHA-1**, a cryptographic hash function: a fixed-size
(40 hex characters, representing 160 bits) output computed from an
input of any size, where changing even one byte of the input produces a
completely different, unpredictable output, and finding two different
inputs that produce the same output is computationally infeasible. This
is what makes **content-addressable storage**, this lesson's own header
term, actually work: the blob holding `inventory_report.py`'s exact
current content will always hash to `3e94d88...` on any machine, because
the hash depends only on the content, never on where it's stored, who
computed it, or when. Also recognized in: how software downloads are
verified against a published checksum before being trusted, how
BitTorrent identifies identical file chunks shared across totally
unrelated uploaders, how a password is stored as a hash rather than in
plain text (a different application of the same underlying function),
and how blockchain systems chain blocks together by including the
previous block's own hash inside the next one — structurally the exact
same parent-pointer idea this lesson's own commit-to-parent-commit chain
already uses.

### SE Lens

The alternative — assigning each commit a simple incrementing number
instead of a content-derived hash — is exactly how some older
centralized version control systems worked, and it has a real cost this
domain's later lessons depend on not having: an incrementing number
requires one single, authoritative counter, which requires one single
place that counter lives. A commit hash requires nothing of the kind —
it's computed from the commit's own content, independently, on whichever
machine created it, with no coordination or shared counter needed at
all. This is exactly why two different engineers, on two different
machines with no network connection between them at the moment of
committing, can each create a commit right now, completely independently,
with zero risk of accidentally colliding on the same address — a
property this domain's Lesson 109 (Merging) and Lesson 111 (Conflict
Resolution) build directly on. The real cost of a content-derived
address: it's unreadable and unmemorable to a person — nobody refers to
"commit ab7614a" out loud in a standup meeting the way they might say
"commit forty-seven," which is exactly why `git log`'s own abbreviated,
human-readable messages, not hashes, are what people actually read day
to day, with the hash serving as the precise, unambiguous address
underneath.

### Commands Needed

- **`git cat-file`** — no separate installation; requires a valid object
  hash (or unambiguous prefix) as an argument, obtained from `git log`'s
  own output or, as with a tree or blob hash, from a previous
  `git cat-file -p` call.

### Run It

From inside the real `inventory-report/` project:

```bash
git cat-file -t ab7614a98b9d2fd58564c1dd354d3a5c5cddd736
git cat-file -p ab7614a98b9d2fd58564c1dd354d3a5c5cddd736
```

prints:

```text
commit
tree 71ef22d0ea75510be894cb71a4cd70550ed8d3f6
author Test User <test@example.com> 1786949990 -0400
committer Test User <test@example.com> 1786949990 -0400

stage inventory_report.py and ignore generated logs
```

Following the `tree` line's own hash one level deeper:

```bash
git cat-file -p 71ef22d0ea75510be894cb71a4cd70550ed8d3f6
```

prints:

```text
100644 blob 397b4a7624e35fa60563a9c03b1213d93f7b6546	.gitignore
100644 blob 3e94d88c8aed187da83daba828a37225680420ca	inventory_report.py
```

and following `inventory_report.py`'s own blob hash one level deeper
still:

```bash
git cat-file -p 3e94d88c8aed187da83daba828a37225680420ca
```

prints, exactly:

```text
def low_stock_items(inventory, threshold=5):
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)
```

`inventory_report.py`'s own real content, recovered directly from three
hops through Git's own real, on-disk object store — nothing about this
was reconstructed from a description; every hash, on every line, is an
address a real command actually followed. Notice, too, that this blob's
hash, `3e94d88...`, is the identical hash Lesson 106's own `git diff`
output already showed, abbreviated, on the right-hand side of its own
`index ce4dd3e..3e94d88` line — the same object, the same content, the
same address, seen twice now from two completely different commands.

### Connecting Back

The Problem step's own question is answered, with direct proof rather
than an assertion: a commit really does contain nothing but a pointer to
a tree, a pointer to a parent (absent here, because this is a root
commit), and metadata — no file content directly, and every actual byte
of `inventory_report.py` recovered only by following two more hashes
down through a tree object to a blob object. This is the real structure
every remaining lesson in this domain quietly assumes from here on:
branches (Lesson 108) are nothing more exotic than a name pointing at
one specific commit hash, and merging (Lesson 109) is nothing more
exotic than creating a new commit with more than one parent hash instead
of one.

---

## Connect the Pieces

Trace the one command this entire lesson exists to finally explain,
start to finish. `git commit`, run against exactly the staged content
Lesson 106 left behind, converted a temporary snapshot into something
new: a permanent commit object, confirmed immediately by `git status`
reporting, for the first time in this project's history, a completely
clean state — working directory, staging area, and history all in
agreement. `git log` proved that permanence was real and durable,
recoverable on demand, long after the original confirmation message had
scrolled off screen — and revealed the exact 40-character hash standing
in as this commit's own permanent address. And `git cat-file`, run three
times in a row, each time following the previous command's own output
one level deeper, opened that address and found real, ordinary,
inspectable data at every level: a commit object pointing to a tree
object, that tree object pointing to two blob objects, and one of those
blobs holding `inventory_report.py`'s exact content — the identical blob
hash, `3e94d88...`, Lesson 106's own `git diff` output had already shown
in passing, now traced all the way to its source. Every lesson in this
curriculum before this one asked you to run `git commit` as a closing
ritual with no explanation. This lesson is the explanation: a commit is
a real, addressable, permanent snapshot, built from ordinary objects a
person can open and read directly, not a black box.

## What Breaks Without This

Cause a real failure `git commit` exists specifically to prevent —
edit `inventory_report.py`'s working-directory copy without staging
the change, and try to trust that the last commit already covers it.
From inside the real `inventory-report/` project, with everything
currently clean per this lesson's own first Concept Unit:

```bash
echo "# generated automatically, do not edit by hand" >> inventory_report.py
git log --oneline
```

prints:

```text
ab7614a stage inventory_report.py and ignore generated logs
```

Still exactly one commit — the new comment line is nowhere in this
history, because it was never staged and never committed. Opening the
committed blob directly proves this even more concretely than `git log`
alone does:

```bash
git cat-file -p ab7614a:inventory_report.py
```

prints the exact same six lines as this lesson's own Run It step
showed earlier, with no comment line anywhere in it — the committed
snapshot is permanently frozen at the moment `git commit` ran, and
nothing about editing the working directory afterward can silently
change what a past commit contains. `git status`, run at this point,
correctly reports `inventory_report.py` as modified, not clean — the
one honest signal that a real, uncommitted change now exists, distinct
from the permanently recorded one. Restoring the file to its committed
state (`git checkout -- inventory_report.py`, a command this domain
hasn't formally taught yet but whose effect can be confirmed with
`git status` reporting clean again) or re-staging and re-committing the
new comment are the two ways forward from here — neither of which this
lesson needed to demonstrate to prove its point: a commit, once made,
cannot be silently altered by further edits to the working directory.

## Exercises

1. In a fresh repository on your own machine, make three commits in a
   row, each changing one small thing, each with a real, distinct
   message. Run `git log --oneline` and confirm all three appear, most
   recent first. Then run `git cat-file -p` against the middle commit's
   own hash and name, specifically, which line in its output proves it
   has exactly one parent — not zero, and not the whole history.
2. Run `git cat-file -p` against any commit's tree hash, then against
   one of the blob hashes that tree lists. Compare the blob's printed
   content, byte for byte, against the real file in your working
   directory that the tree object names it as. Are they identical? Are
   they expected to be, given everything this lesson explained about
   what a commit actually stores?
3. Make a commit, then edit the same file afterward without staging the
   edit. Run `git log --oneline` and confirm the edit doesn't appear.
   Then use `git cat-file -p <commit-hash>:<filename>` (the same syntax
   this lesson's own "What Breaks Without This" section used) to read
   the committed version directly, and compare it, line by line, against
   what your working directory currently contains.

## Definition of Done

- [ ] `inventory-report/` has at least one real commit, made with
      `git commit -m "..."`, confirmed by `git status` reporting a clean
      working tree immediately afterward.
- [ ] `git log`, run against the project, shows that commit's full hash,
      author, date, and message.
- [ ] `git cat-file -p` has been run against that commit's own hash, and
      separately against the tree hash and at least one blob hash it
      leads to — three real objects opened, not just described.
- [ ] The "what breaks without this" scenario has been reproduced: an
      uncommitted edit confirmed absent from both `git log` and a direct
      `git cat-file -p <commit>:<file>` read of the committed blob.
- [ ] You can state, without looking anything up, what the three object
      types a commit is built from are, and which one directly contains
      file content.

Commit this lesson's own final state — this time, for real, with an
honest understanding of exactly what the command does:

```bash
git commit -m "confirm inventory_report.py commit and inspect its object graph"
```

(There is nothing new to stage at this point in the real project — this
final commit is illustrative of the habit, not a required action against
`inventory-report/` itself, which is already clean.)
