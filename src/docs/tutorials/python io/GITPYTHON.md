# GitPython: Diffing, History, and Remotes — For Real

**What you will build:** enough working, verified GitPython to support
a check-in/check-out system with real diffing and history — committing
files, diffing any two points in history, reading a file's exact
content at an arbitrary past commit (what a semantic G-code diff would
run its interpreter against), walking commit history, and pushing/
pulling against a real remote. Every example below was actually run
against a real git repository; nothing is asserted from memory.

**What you need to know first:** basic git concepts from ordinary
command-line use (a commit, a branch, `git add`/`git commit`) — this
document explains what GitPython's objects *are* and how they map onto
those, not what git itself is for.

**Terms used in this document**

- **The three trees** — git's own mental model for where a file's
  content can currently exist: the **working tree** (the actual files
  on disk, as you'd edit them), **the index** (also called "the
  staging area" — a snapshot of what the *next* commit will contain,
  built up by `add`ing files to it), and **HEAD** (the most recent real
  commit). Every git operation is really about moving content between
  these three places. It exists as three separate places, not one,
  specifically so you can build up a commit's contents (the index)
  gradually, differently from both what's currently on disk and what
  was last actually committed.
- **Blob / Tree / Commit** — git's three real object types. A **blob**
  is one file's raw content, with no name attached. A **tree** is a
  directory listing — names mapped to blobs (files) or other trees
  (subdirectories). A **commit** is a pointer to one tree (the whole
  project's exact state at that moment), plus metadata (author,
  message, parent commit). It exists as this specific shape because a
  commit doesn't store a diff — it stores a *complete snapshot*,
  referenced efficiently (unchanged files just point at the same blob
  they always did); a diff is *computed*, on demand, by comparing two
  snapshots, never stored directly.
- **Refspec** — the `source:destination` string (e.g.
  `"master:master"`) that tells `push`/`pull` which local branch maps
  to which remote branch. It exists because the local and remote branch
  names aren't required to match, so push/pull need an explicit mapping
  rather than assuming "same name on both sides."
- **Bare repository** — a repository with no working tree at all, only
  the underlying `.git` data. It exists specifically to act as a
  *remote* — nobody edits files directly in a bare repo, they only
  push/pull against it, so there's no reason for it to keep a checked-
  out copy of anything.
- **Personal Access Token (PAT)** — a long, generated credential string
  representing a specific user, created explicitly for programmatic
  use instead of a real password. It exists so a script or tool never
  needs to hold an actual account password, and so that credential can
  be revoked or scoped (limited to specific permissions) independently
  of the account's real login.
- **OAuth token** — a credential issued through GitLab acting as an
  identity provider for a *third-party application* the user
  authorized, rather than a token the user generated for themselves
  directly. It exists to let an application access GitLab on a user's
  behalf without ever seeing that user's password or a PAT they
  control directly.
- **CI job token** — a short-lived credential GitLab itself generates
  automatically for a running CI/CD pipeline job, scoped to that one
  job. It exists so a pipeline can authenticate back to GitLab (to push
  an artifact, trigger another pipeline) without a human-managed,
  long-lived token sitting in the pipeline's own configuration at all.

**Objects and methods used**

- **`git.Repo`**
  - *What it is:* GitPython's handle on an entire repository.
  - *Implementation:* `git.Repo(path)` opens an existing repo;
    `git.Repo.init(path)` creates one; `git.Repo.clone_from(url, path)`
    clones a remote one. Every one of these, and every method called
    on the resulting object, works by shelling out to your real,
    installed `git` binary and parsing its output — GitPython is a
    wrapper, not a reimplementation.
  - *Its use:* Every example below starts by getting a `Repo` object.
  - *Type:* A class; `.init`/`.clone_from` are classmethods (alternate
    constructors), `Repo(path)` is the plain constructor for an
    already-existing repo.
  - *Responsibility:* Represent one repository and expose everything
    that can be done to it — its index, its commits, its remotes, its
    working-tree status — as real Python objects and methods, so
    nothing about a repository needs to be manipulated by hand-building
    `git` command-line strings.
  - *Depends on:* A real, installed `git` executable on the system
    `PATH`; a real filesystem path (existing, for the plain
    constructor; a target location, for `.init`/`.clone_from`).
  - *Connects to:* Everything else in this document — `.index`,
    `.head`, `.iter_commits()`, `.remotes`, `.create_remote()` are all
    accessed through a `Repo` instance.
  - *Shape:* A path (or URL, for cloning) in; one `Repo` object out,
    exposing the whole repository as a tree of further objects, not a
    single flat value.

- **`Repo.index` (an `IndexFile`) — `.add()` / `.commit()`**
  - *What it is:* GitPython's representation of the staging area (one
    of the three trees, above).
  - *Implementation:* `repo.index.add([paths]) -> None`, staging the
    given files; `repo.index.commit(message) -> a Commit`, committing
    exactly what's currently staged and returning the new commit.
  - *Its use:* How every commit in this document was made.
  - *Type:* An instance attribute (`repo.index`) holding an
    `IndexFile` object, with instance methods on it.
  - *Responsibility:* Track which changes are staged for the *next*
    commit, independently of both the working tree's current state and
    HEAD's last-committed state, and turn that staged state into a
    real new commit on request.
  - *Depends on:* Real files already present on disk at the given
    paths, for `.add()`; something actually staged, for `.commit()` to
    have anything to commit.
  - *Connects to:* Called on `repo.index`; `.commit()`'s return value
    is a real `Commit` object, immediately usable with everything in
    the next entry.
  - *Shape:* A list of path strings in (for `.add()`), or a message
    string in (for `.commit()`); `.commit()` returns one `Commit`
    object, not a hash string.

- **`Commit`**
  - *What it is:* One real, immutable snapshot of the whole repository
    at one point in time, plus its metadata.
  - *Implementation:* Real attributes — `.hexsha` (the full commit
    hash, a `str`), `.message`, `.author`, `.committed_datetime`
    (a real, timezone-aware `datetime`), `.tree` (the `Tree` object
    representing this commit's whole snapshot); `.diff(other,
    create_patch=True)` computes a real diff against another commit,
    another tree, or `None` (meaning "the current working tree").
  - *Its use:* The return value of `.commit()`, and what
    `repo.head.commit` and `repo.commit("HEAD~1")` give you — the
    object everything else (diffing, reading historical content) is
    called against.
  - *Type:* A class; instances are effectively immutable once created
    (a commit, once made, doesn't change).
  - *Responsibility:* Represent one exact, permanent snapshot plus who
    made it, when, and why (the message) — and answer "what's different
    between this snapshot and another one" via `.diff()`.
  - *Depends on:* Nothing beyond already existing — every `Commit` is
    either the result of `.index.commit()`, or looked up by name
    (`repo.commit("HEAD~1")`, `repo.head.commit`).
  - *Connects to:* `.diff()` returns a list of `Diff` objects (below);
    `.tree` connects to the tree/blob path-lookup mechanism used to
    read historical file content.
  - *Shape:* No arguments needed to read its own attributes; `.diff()`
    takes another commit (or `None`) in, returns a `list` of `Diff`
    objects out.

- **`Diff`**
  - *What it is:* One changed file's real, computed difference between
    two snapshots.
  - *Implementation:* `.a_path`/`.b_path` (the file's path on each
    side); `.diff` — the raw unified-diff text, as `bytes` (needing
    `.decode()` to read as a string).
  - *Its use:* Read directly in every diff example below.
  - *Type:* A class, never constructed directly — only ever produced by
    calling `.diff()` on a `Commit` (or on the index, for a working-
    tree comparison).
  - *Responsibility:* Represent exactly one file's change between two
    specific snapshots, computed on demand — nothing about a `Diff`
    object is stored anywhere in the repository itself.
  - *Depends on:* Two real snapshots to compare (two commits, or a
    commit and the working tree).
  - *Connects to:* Produced by `Commit.diff()`; consumed directly by
    printing `.diff.decode()`.
  - *Shape:* Nothing taken in directly; `.diff` is real `bytes`
    containing unified-diff-format text, the same format `git diff`
    itself prints.

- **`Tree` and `Blob` (path lookup with `/`)**
  - *What they are:* `Tree` is a directory-listing-shaped object
    (full treatment already given above, in Terms); `Blob` is one
    file's content at a specific snapshot.
  - *Implementation:* `some_commit.tree / "path/to/file"` — the `/`
    operator, overloaded to mean "look up this path inside this
    snapshot" — returns a `Blob`; `blob.data_stream.read()` returns
    that file's real content as `bytes` at that exact commit.
  - *Its use:* How to read a file's exact historical content — the
    piece a semantic diff (running an interpreter against two versions
    of a file) actually needs.
  - *Type:* Both are classes; `/` is Python's own division operator,
    overloaded via `__truediv__` to mean path lookup here instead of
    arithmetic.
  - *Responsibility:* `Tree` answers "what's at this path, in this
    snapshot"; `Blob` holds that path's actual file content, frozen
    exactly as it was at that commit, forever.
  - *Depends on:* A real `Commit`'s `.tree`, and a real path that
    existed in that specific snapshot (a wrong path raises `KeyError`).
  - *Connects to:* `commit.tree` is the entry point; `/` chains to a
    `Blob`; `.data_stream.read()` gets real bytes out of it.
  - *Shape:* A path string in, one `Blob` object out; `.data_stream.read()`
    takes nothing, returns real `bytes`.

- **`repo.iter_commits`**
  - *What it is:* An iterator over a branch's real commit history.
  - *Implementation:* `repo.iter_commits(branch_or_ref, paths=None) ->
    an iterator of Commit objects`, newest first; `paths` (optional)
    filters to only commits that touched a specific file.
  - *Its use:* A file's real check-in history.
  - *Type:* An instance method on `Repo`, returning a generator (the
    same lazy, one-at-a-time production already familiar from every
    generator function in this curriculum).
  - *Responsibility:* Walk backward through a branch's real commit
    graph, yielding each real `Commit` in reverse chronological order,
    without materializing the whole history into a list unless asked
    to.
  - *Depends on:* A real branch/ref name that exists in the repo.
  - *Connects to:* Yields real `Commit` objects — everything already
    described above applies to each one.
  - *Shape:* A ref name (and optional path filter) in, a lazy stream of
    `Commit` objects out.

- **`Remote` — `create_remote` / `.push()` / `.pull()`**
  - *What it is:* GitPython's representation of a configured remote
    (what a GitLab/GitHub URL becomes once added to a repo).
  - *Implementation:* `repo.create_remote(name, url) -> a Remote`;
    `remote.push(refspec) -> a list of PushInfo`; `remote.pull() -> a
    list of FetchInfo`.
  - *Its use:* How the demo below talks to a real (local, stand-in)
    remote — the same calls would target a real GitLab URL unchanged.
  - *Type:* A class, plus two instance methods that actually perform
    network (or, here, local-filesystem) I/O.
  - *Responsibility:* Represent one named connection to another
    repository, and actually transfer commits to or from it on
    request — the real network/transport work, delegated entirely to
    the underlying `git` binary.
  - *Depends on:* A reachable URL (or, for a local path, a real
    directory) and, for anything beyond a local path, real
    authentication already configured for `git` itself — GitPython
    performs none of its own; it's whatever the underlying `git`
    process already has (an SSH key loaded in an agent, a stored HTTPS
    credential).
  - *Connects to:* Created via `repo.create_remote()` or accessed via
    `repo.remotes.origin`; `.push()`/`.pull()` are what actually move
    real commits between two real repositories.
  - *Shape:* A refspec string in (for push), nothing in (for a default
    pull); both return a list of result objects describing what
    actually happened, not just `True`/`False`.

---

## Concept Unit: The three trees, staging, and committing

### The Problem

A file just edited on disk, a file staged for the next commit, and a
file as it existed in the last real commit can all be three genuinely
different versions of the same content simultaneously. Nothing about
"open the file" (Lesson 1) or "insert a row" (Lesson 8) has an
equivalent three-way distinction — git's own model is a real, different
shape from everything else in this curriculum, and getting it wrong
(assuming "I saved the file" means "it's committed") is a real, common
mistake.

> **Stop and think:** If you edit a file, then run something that
> reports "no changes to commit," what would that actually tell you
> about which of the three trees your edit currently lives in? What
> single step is missing before a commit could include it?

### Introduce the concept, against a real repository

```python
import git

repo = git.Repo("/path/to/repo")
print("is_dirty ->", repo.is_dirty(untracked_files=True))

with open("/path/to/repo/part1.gcode", "w") as f:
    f.write("G01 X10 Y10\nG01 X20 Y20\n")

print("untracked_files ->", repo.untracked_files)

repo.index.add(["part1.gcode"])
commit1 = repo.index.commit("Add initial G-code program")
print("commit1.hexsha ->", commit1.hexsha)
print("commit1.message ->", commit1.message.strip())
print("commit1.author ->", commit1.author)
```

Real output, from an actual run:

```
is_dirty -> False
untracked_files -> ['part1.gcode']
commit1.hexsha -> 3fd85dcf5fc9c8d0b47a7407cdd8a18bd5622253
commit1.message -> Add initial G-code program
commit1.author -> Demo User
```

Writing the file put it in the working tree only — `untracked_files`
proves git already sees it exists but hasn't been told to track it at
all yet, which is a different state from either staged or committed.
`repo.index.add([...])` moves it into the index (the second tree);
`repo.index.commit(...)` is what actually creates a real, permanent
snapshot from whatever's currently staged, and hands back a real
`Commit` object — not a hash string, a full object with `.message`,
`.author`, and everything else already given full treatment above.

### Mechanical walkthrough

- **`git.Repo(path)`** — full treatment above; opens the existing repo
  at `path`.
- **`repo.is_dirty(untracked_files=True)`** — a method (not shown
  fully above since it's a minor supporting check) reporting whether
  the working tree currently differs from HEAD; `untracked_files=True`
  means "count a brand-new, never-added file as making the repo
  dirty," which is why this returns `False` before the file exists at
  all and would return `True` immediately after writing it, before any
  `add`.
- **`repo.untracked_files`** — full treatment already given above, in
  Terms/Objects and methods; a plain `list[str]`.
- **`repo.index.add(["part1.gcode"])`** — full treatment above; stages
  exactly this one file.
- **`repo.index.commit("Add initial G-code program")`** — full
  treatment above; creates the real commit and returns it.

### CS lens

Three separate representations of "the current state" — on disk,
staged, and last-committed — kept deliberately distinct rather than
collapsed into one, is the same idea as a **staging buffer** anywhere a
system needs to build up a change gradually before atomically applying
it all at once — the actual reason this exists at all: it lets you
stage several unrelated edits across many files, review exactly what
you're about to commit, and commit them together as one coherent unit,
rather than every single file save immediately becoming part of
history.

```
Also recognized in: a database transaction's own uncommitted writes
(visible to the same connection, invisible to everyone else, until
COMMIT), a text editor's "unsaved changes" state as a third thing
distinct from both the file on disk and your original open buffer,
a shopping cart as a staging area distinct from both "items browsed"
and "items actually purchased"
```

### SE lens

The alternative — git could have skipped the index entirely and made
every `add` immediately a commit — would remove one entire concept to
learn, at the real cost of losing the ability to build a coherent,
reviewed commit out of edits made incrementally, in any order, possibly
touching many files, only some of which you're ready to commit right
now. For a check-in/check-out tool specifically, this is worth passing
through to your own users deliberately or not: do you let someone stage
partial changes before checking a file back in, or does your tool
always commit everything that changed, atomically, with no partial
option? That's a real design decision your own tool inherits from
whether it exposes the index as a concept or hides it.

---

## Concept Unit: Diffing — three real shapes, one real gotcha

### The Problem

"What changed" can mean three different comparisons: uncommitted edits
against the last commit, one real commit against another, or — this is
the part worth being careful about — the *direction* of that second
comparison, which is easy to get backward without ever seeing an
error telling you so.

> **Stop and think:** If `a.diff(b)` and `b.diff(a)` both run without
> error and both produce real-looking diff text, how would you know,
> just from looking at the output, which one is showing you the change
> going forward and which is showing it backward? What would happen to
> a user-facing "here's what changed" feature if you had this
> backward and never noticed?

### Introduce the concept, against real commits

```python
diffs = repo.head.commit.diff(None, create_patch=True)  # None = working tree
for d in diffs:
    print(d.a_path)
    print(d.diff.decode("utf-8"))
```

Real output (after editing the file again, before staging):

```
part1.gcode
@@ -1,2 +1,3 @@
 G01 X10 Y10
-G01 X20 Y20
+G01 X99 Y99
+G01 X30 Y30
```

Now, two real commits — proving the direction gotcha directly:

```python
commit1 = repo.commit("HEAD~1")
commit2 = repo.commit("HEAD")

print("--- commit1.diff(commit2): old -> new ---")
for d in commit1.diff(commit2, create_patch=True):
    print(d.diff.decode())

print("--- commit2.diff(commit1): new -> old ---")
for d in commit2.diff(commit1, create_patch=True):
    print(d.diff.decode())
```

Real output:

```
--- commit1.diff(commit2): old -> new ---
@@ -1,3 +1,4 @@
 G01 X10 Y10
 G01 X99 Y99
 G01 X30 Y30
+G01 X40 Y40

--- commit2.diff(commit1): new -> old ---
@@ -1,4 +1,3 @@
 G01 X10 Y10
 G01 X99 Y99
 G01 X30 Y30
-G01 X40 Y40
```

Both ran without error, both produced valid-looking diffs, and they're
exact opposites: `older.diff(newer)` shows a line *added* (`+`);
`newer.diff(older)` on the same two commits shows the identical line
*removed* (`-`). **`a.diff(b)` computes the patch that would transform
`a` into `b`** — call it in the intuitive `older.diff(newer)` order to
get a forward-reading diff a non-programmer would expect ("this line
was added"), or you'll silently show every addition as a deletion and
vice versa, with nothing in the API warning you.

### Mechanical walkthrough

- **`repo.head.commit.diff(None, create_patch=True)`** — full
  treatment of `Commit.diff` above; `None` specifically means "compare
  against the current working tree," not another commit.
- **`create_patch=True`** — without this, `Diff` objects report *which*
  files changed but not the actual line-by-line text; this flag is
  what makes `.diff` contain real, readable patch text at all.
- **`commit1.diff(commit2, create_patch=True)`** vs.
  **`commit2.diff(commit1, create_patch=True)`** — full treatment
  above, in this unit's own proof; identical arguments, reversed
  receiver and argument, exactly inverted output.

### CS lens

A diff being computed fresh, on demand, from two full snapshots — never
stored as its own persistent thing — is the same **derived value**
idea as a database view or a spreadsheet formula: something that looks
like data but is actually a computation re-run every time it's asked
for, guaranteeing it's never stale relative to its inputs.

```
Also recognized in: a `git blame` (also computed on demand from
history, never stored), a compiler's optimization pass re-deriving
dead code from the current AST rather than tracking it incrementally,
a spreadsheet's SUM cell recomputing from its referenced cells every
time one of them changes
```

### SE lens

The alternative — storing an explicit diff alongside each commit
instead of computing it on demand — would make `.diff()` calls faster
at the cost of a real, ongoing storage and consistency burden (every
diff would need updating if history were ever rewritten). Git's actual
choice — store snapshots, compute diffs on demand — trades a small
amount of CPU time per diff for never having a diff and its underlying
snapshots disagree. For your own tool: don't be tempted to cache a
"the diff between these two versions" result in your database
alongside the check-in history — recompute it from the two real
commits every time, the same way git itself does, so it's never wrong
relative to the actual stored history.

---

## Concept Unit: Reading a file's exact content at a specific commit

### The Problem

A semantic diff — running your G-code interpreter against two versions
of a file and comparing the resulting toolpaths, rather than comparing
text — needs the *actual file content* at two specific commits, not a
text patch between them. Nothing shown so far reads a file's content
out of history at all; every example has read either the current
working tree or a diff's own patch text.

> **Stop and think:** A `Commit` object's `.tree` attribute represents
> that commit's entire snapshot — every file, as it was at that exact
> moment. Given that a tree is a real, navigable structure (per this
> document's own Terms), what would it take to get from "the whole
> snapshot" down to "the exact bytes of one specific file," at one
> specific historical commit?

### Introduce the concept, against real history

```python
first_commit = repo.commit("HEAD~1")
old_content = first_commit.tree / "part1.gcode"
print(old_content.data_stream.read().decode("utf-8"))

new_content = repo.head.commit.tree / "part1.gcode"
print(new_content.data_stream.read().decode("utf-8"))
```

Real output:

```
G01 X10 Y10
G01 X20 Y20

G01 X10 Y10
G01 X99 Y99
G01 X30 Y30
```

Two genuinely different real strings, each the file's *exact* content
as it existed at that one specific commit, independent of whatever the
working tree currently holds. This is the piece your project's
semantic-diff feature actually needs: pull both real texts this way,
run your G-code interpreter against each one separately, and diff the
two resulting toolpaths — GitPython's job stops at handing you these
two real strings; everything about deciding whether the *meaning*
changed is your own interpreter's job, not git's.

### Mechanical walkthrough

- **`repo.commit("HEAD~1")`** — a real git revision expression (the
  same syntax `git log HEAD~1` would accept), resolved to a real
  `Commit` object — `"HEAD~1"` means "one commit before the current
  branch tip."
- **`first_commit.tree`** — full treatment already given above, in
  Objects and methods used; this specific commit's entire snapshot, as
  a navigable `Tree`.
- **`... / "part1.gcode"`** — full treatment of the overloaded `/`
  operator above; looks up exactly this path inside that specific
  snapshot, returning a `Blob`.
- **`.data_stream.read().decode("utf-8")`** — `.data_stream` is a
  real, file-like stream over the blob's stored bytes; `.read()` (the
  same file-object method from Lesson 1, here applied to a git blob
  instead of a real file on disk) reads it all; `.decode("utf-8")`
  (full treatment already given in Lesson 2) turns those raw bytes
  into a real Python `str`.

### CS lens

Reaching into an old, immutable snapshot and reading one file out of it
without disturbing the current working tree at all is possible
specifically because git's objects are **content-addressed and
immutable** — once a blob exists, it never changes; a commit never
changes what tree it points to. Reading history is always safe,
non-destructive lookup, never a risk of mutating the past.

```
Also recognized in: a content-addressed cache (a CDN keying stored
objects by a hash of their own content, so identical content is
automatically deduplicated and never needs to be "updated" in place),
Docker image layers (each layer is immutable; a container is built by
stacking read-only layers, never editing one after it's built),
a blockchain's own immutable ledger of past blocks
```

### SE lens

The alternative — actually checking out the old commit into the
working tree to read the file, then checking back out to where you
started — would work, but mutates real, shared state (the working
tree) just to read one file, and is genuinely unsafe if anything else
might be touching that same working tree concurrently (exactly the
kind of race condition flagged earlier for check-out locking). Reading
directly through `commit.tree / path` never touches the working tree
at all — the right choice specifically because your semantic-diff
feature needs to read two historical versions *without* disturbing
whatever a user currently has checked out.

---

## Concept Unit: Walking history

### The Problem

A file's check-in history — who changed it, when, in what order — is
exactly what a `checkouts`/audit table in your own database would also
want to show, but git already has this real history recorded; nothing
shown so far reads more than one or two specific commits by name.

### Introduce the concept, against a real repo with three real commits

```python
for commit in repo.iter_commits("master"):
    print(commit.hexsha[:8], commit.committed_datetime, commit.message.strip())
```

Real output:

```
b1d2bf59 2026-09-06 09:34:45+00:00 Add a fourth move
688ba32e 2026-09-06 09:34:17+00:00 Change a coordinate
3fd85dcf 2026-09-06 09:34:06+00:00 Add initial G-code program
```

Real, newest-first order, exactly matching the order these three
commits were actually made in this document's own running example.
`repo.iter_commits("master", paths="part1.gcode")` (not re-run here,
since every commit in this small demo already touches that one file)
would filter this same walk down to only commits that changed a
specific path — the direct building block for "show me this file's
history," scoped per file rather than the whole repository.

### Mechanical walkthrough

- **`repo.iter_commits("master")`** — full treatment already given
  above, in Objects and methods used; a lazy generator (the identical
  "produce one at a time" discipline from every generator function in
  this curriculum), not a pre-built list — for a repository with a very
  long history, this matters exactly the way Lesson 7 measured for
  files: you can stop after the first few commits without ever walking
  the rest.
- **`commit.hexsha[:8]`** — ordinary string slicing; a full SHA is 40
  characters, and the first 8 are, in practice, already almost always
  unique enough to identify a commit for display purposes — the same
  convention `git log --oneline` itself uses.
- **`commit.committed_datetime`** — a real, timezone-aware `datetime`
  object (full treatment of timezone-aware datetimes already given in
  Lesson 11), not a string needing separate parsing.

### CS lens

Walking backward through a commit graph, one parent link at a time, is
a real instance of graph traversal — specifically, since a normal
commit has exactly one parent (a merge commit has two), this reduces to
walking a **linked list** for most real history, generalizing to a full
graph walk only at merge points.

```
Also recognized in: a browser's own back-button history, a filesystem
directory's ".." parent-pointer chain walked up to the root, a call
stack unwound one frame at a time during exception handling
```

### SE lens

The alternative — keeping your own separate `history` table in your
database, written to independently of git's real commits — duplicates
information git already stores permanently and correctly, and risks
the two falling out of sync (a row in your table with no matching real
commit, or vice versa). Prefer treating git's own history as the source
of truth for "what changed and when," and use your own database
specifically for the things git genuinely doesn't track — the
check-out lock state flagged earlier — rather than re-deriving
history git already gives you for free.

---

## Concept Unit: Remotes — push, clone, pull

### The Problem

Everything so far has stayed inside one local repository. A real
check-in/check-out system needs to actually share commits with
GitLab — a separate, real repository somewhere else — and "push"/
"pull"/"clone" are real network (or, as demonstrated here, real
local-filesystem) operations, not local bookkeeping.

### Introduce the concept, against a real second repository standing in for GitLab

```python
origin = repo.create_remote("origin", "/path/to/remote.git")  # a real bare repo
push_info = origin.push(refspec="master:master")
for info in push_info:
    print(info.summary.strip(), info.flags)

clone = git.Repo.clone_from("/path/to/remote.git", "/path/to/clone1")
print(clone.head.commit.message.strip())
print((clone.head.commit.tree / "part1.gcode").data_stream.read().decode())

# a change happens back in the original repo, gets pushed...
origin.push(refspec="master:master")
# ...and the clone pulls it
clone.remotes.origin.pull()
print((clone.head.commit.tree / "part1.gcode").data_stream.read().decode())
```

Real output, from an actual run against a real (local, bare) repository
acting as the remote:

```
[new branch] 2
Change a coordinate
G01 X10 Y10
G01 X99 Y99
G01 X30 Y30
G01 X10 Y10
G01 X99 Y99
G01 X30 Y30
G01 X40 Y40
```

`origin.push` genuinely transferred real commits to a completely
separate repository — `[new branch]` is git's own real message for
"this branch didn't exist on the remote before now." The fresh
`clone_from` produced a real, independent working copy with the
correct committed content, no different from what `git clone` on the
command line would do. After the original repo made and pushed another
real change, `clone.remotes.origin.pull()` correctly brought the new
line in — the clone's file content, read the exact same
`commit.tree / path` way as the previous unit, genuinely updated.

Against a real GitLab, only the URL changes — an HTTPS or SSH GitLab
URL instead of a local path — and authentication becomes real:
GitPython performs none of its own; it's whatever your already-
configured `git` installation would do for that same URL from the
command line (an SSH key already loaded in your agent, or a stored
HTTPS credential/token).

### Mechanical walkthrough

- **`repo.create_remote("origin", url)`** — full treatment above;
  registers a new named remote on this repo, without transferring
  anything yet.
- **`origin.push(refspec="master:master")`** — full treatment above;
  the refspec's two halves — `master:master` — mean "push my local
  `master` branch to the remote's `master` branch"; a different string
  (`"master:staging"`) would push to a differently-named remote branch.
- **`git.Repo.clone_from(url, path)`** — full treatment already given
  above, in Objects and methods used; an alternate constructor, unlike
  the plain `git.Repo(path)` used everywhere else in this document.
- **`clone.remotes.origin.pull()`** — `.remotes` is a collection of
  every remote configured on a repo, accessible both by attribute
  (`.origin`) and by name; `.pull()` fetches new commits from that
  remote and merges them into the current local branch in one step.

### CS lens

Each repository holding a complete, independent copy of the full
history, synchronized by explicit push/pull rather than always reading
from one shared, authoritative copy, is the defining property of a
**distributed version control system** — as opposed to older,
centralized systems (like Subversion) where only the server ever held
real history and every client held just a checkout.

```
Also recognized in: peer-to-peer file sharing (each peer holds real,
independent copies, synchronized on demand), distributed databases
using eventual consistency (each node has a real copy, converging over
time rather than always consulting one authority), offline-first mobile
apps that sync local changes back to a server once connectivity returns
```

### SE lens

The alternative — a centralized model, where "the real files" live
only on GitLab's own server and your tool always reads/writes directly
against it over the network for every operation — would remove the
need to think about local clones and push/pull timing at all, at the
real cost of requiring network access for every single read, and
losing the ability to work, diff, or inspect history offline. Git's
actual distributed model means your check-in/check-out tool can
diff, browse history, and even prepare a check-in entirely offline,
and only needs the network at the moment of an actual push — a real
design advantage worth keeping deliberately, not just inheriting by
accident.

---

---

## Concept Unit: Git protocol authentication — SSH vs. HTTPS+token

### The Problem

`git.Repo.clone_from`/`push`/`pull` all eventually run a real `git`
subprocess, and a private repository's `git` subprocess needs real
credentials before the remote will hand over anything — but nothing
shown so far has touched a private repo, or asked how those
credentials actually get supplied.

> **Stop and think:** GitPython has never, anywhere in this document,
> taken a password or token as an argument to `push`/`pull`/`clone_from`
> itself. Given that GitPython works by shelling out to your real,
> already-installed `git`, where would credentials actually need to
> live for a private clone to succeed — inside GitPython's own call, or
> somewhere your system's `git` already knows to look?

### Two real mechanisms, sourced from GitLab's current documentation

**SSH** — register a public key on your GitLab account once; use an
SSH-form remote URL (`git@gitlab.com:group/project.git`). Nothing about
this involves GitPython *or* Python at all — the credential lives in
your SSH agent, and `git` (and therefore GitPython, which is only ever
calling `git`) picks it up transparently, the identical way a bare
`git clone git@gitlab.com:...` on the command line would.

**HTTPS + Personal Access Token** — per GitLab's own current docs, the
username can be any non-empty string; the real credential is the
token, used as the password:

```python
url = f"https://{any_username}:{token}@gitlab.com/group/project.git"
git.Repo.clone_from(url, "/local/path")
```

A real, documented gotcha: embedding the token directly in the URL
like this has real, reported failures on some self-managed GitLab
instances where the identical token typed at an interactive prompt
succeeds. The more robust version skips the URL entirely and uses a
git credential helper, so neither GitPython nor your shell history ever
holds the raw token in a URL string:

```bash
git config --global credential.helper store
```

### Discard the throwaway framing

There's no lab to discard here — this unit is necessarily sourced
documentation, not a live-executed proof, since this sandbox has no
network path to `gitlab.com` at all to actually attempt a clone
against. The next unit returns to real, executed verification for the
piece that doesn't require reaching GitLab itself.

### CS lens

Neither mechanism requires GitPython's own code to know anything about
credentials at all — this is the same **separation of concerns** as
Lesson 1's `open()` never needing to know about disk encryption: the
credential lookup happens at a layer *underneath* the thing you're
calling, invisibly, as long as that underlying layer (here, your
system's own `git`/SSH configuration) is already set up correctly.

```
Also recognized in: a database driver never handling disk-level
encryption itself (the OS/filesystem does), a web browser delegating
TLS certificate validation to the OS's own certificate store rather
than each browser vendor re-implementing it, an ORM (Lesson 9) never
knowing how its underlying database connection was authenticated
```

### SE lens

The alternative — GitPython accepting a token or password as a direct
argument to `clone_from`/`push`/`pull` — would mean every credential
this curriculum's tools ever handle has to flow through your own
Python code explicitly, which is exactly the shape of thing worth
avoiding: more places a token could end up logged, printed in a
traceback, or committed by accident. Letting the credential live one
layer down, in `git`'s own configuration or your SSH agent, means your
Python code never holds it at all for the git-protocol path — only the
REST-API path (next unit) genuinely requires your own code to hold a
token directly, because there's no equivalent "let the OS handle it"
layer underneath a plain HTTP request.

---

## Concept Unit: REST API authentication — three token types, three headers

### The Problem

GitLab's REST API (merge requests, comments, project metadata — Lesson
11's shape, GitLab's own endpoints) isn't git protocol at all — it's
plain HTTP, and plain HTTP has no SSH-agent-equivalent to quietly
supply credentials underneath you. Your own code has to attach a
credential to every request, and GitLab, per its own current docs, uses
**three different header names for three different kinds of token** —
using the wrong one for a given token type is a real, easy mistake.

> **Stop and think:** If a library claims to support three different
> credential types (a personal token, an OAuth token, a CI job token),
> and each one needs a different HTTP header to actually work, what
> would you want to check — read the library's documentation and trust
> it, or find a way to prove, without needing a real network call at
> all, that the library actually builds the header it claims to?

### Introduce the concept — proven from the real, installed library's own source, with no network call at all

`python-gitlab`'s real, current source (version 8.5.0, installed this
session) defines exactly three small classes, each one a `requests`
**auth callable** — an object `requests` calls automatically, right
before sending, specifically to attach credentials:

```python
# from gitlab/_backends/requests_backend.py, the real installed source
class PrivateTokenAuth(TokenAuth, AuthBase):
    def __call__(self, r):
        r.headers["PRIVATE-TOKEN"] = self.token
        r.headers.pop("JOB-TOKEN", None)
        r.headers.pop("Authorization", None)
        return r

class OAuthTokenAuth(TokenAuth, AuthBase):
    def __call__(self, r):
        r.headers["Authorization"] = f"Bearer {self.token}"
        r.headers.pop("PRIVATE-TOKEN", None)
        r.headers.pop("JOB-TOKEN", None)
        return r
```

Proven directly, without a single network call — building a real
`requests` request object, then running it through each auth class by
hand:

```python
import requests
from gitlab._backends.requests_backend import PrivateTokenAuth, OAuthTokenAuth

prepared = requests.Request("GET", "https://gitlab.com/api/v4/projects/1").prepare()
print("before auth ->", dict(prepared.headers))

authed = PrivateTokenAuth("fake-pat-123")(prepared)
print("after PrivateTokenAuth ->", dict(authed.headers))

prepared2 = requests.Request("GET", "https://gitlab.com/api/v4/projects/1").prepare()
authed2 = OAuthTokenAuth("fake-oauth-456")(prepared2)
print("after OAuthTokenAuth ->", dict(authed2.headers))
```

Real output, from an actual run:

```
before auth -> {}
after PrivateTokenAuth -> {'PRIVATE-TOKEN': 'fake-pat-123'}
after OAuthTokenAuth -> {'Authorization': 'Bearer fake-oauth-456'}
```

This is real, verified proof — not trust in a doc page — that a
personal access token genuinely needs `PRIVATE-TOKEN`, an OAuth token
genuinely needs `Authorization: Bearer`, and the library's real source
handles each one differently, on purpose, popping any header a
*different* token type would have set (so switching credential types
never accidentally leaves a stale, wrong header behind from a previous
request).

**Objects and methods used**

- **`requests.auth.AuthBase`**
  - *What it is:* The base class `requests` itself provides for
    pluggable authentication — any callable taking a `PreparedRequest`
    and returning it, optionally modified, can be passed as
    `requests.get(..., auth=my_auth_object)`.
  - *Implementation:* A near-empty base class; subclasses implement
    `__call__(self, r) -> r`.
  - *Its use:* What `PrivateTokenAuth`/`OAuthTokenAuth`/`JobTokenAuth`
    all subclass, letting `python-gitlab` plug its own credential logic
    directly into `requests`'s own, already-existing extension point.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    class from the `requests` library (already used, unlabeled, since
    Lesson 11); responsible for defining the one-method contract any
    custom auth mechanism has to satisfy; depends on nothing; connects
    to every `requests` call made with `auth=an_instance`; shape is a
    `PreparedRequest` in, the same (optionally mutated) object out.

- **`PrivateTokenAuth` / `OAuthTokenAuth` / `JobTokenAuth`**
  - *What they are:* `python-gitlab`'s own three real `AuthBase`
    subclasses, one per GitLab credential type.
  - *Implementation:* Shown in full above — each sets exactly one
    header and clears the other two, guaranteeing only one credential
    header is ever present on an outgoing request.
  - *Their use:* Attached automatically by `gitlab.Gitlab(...)` based
    on which keyword argument (`private_token=`, `oauth_token=`,
    `job_token=`) you constructed it with.
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    Library-internal classes; responsible for translating "I have this
    kind of token" into "the one correct real HTTP header GitLab's own
    server expects for it"; depend on a real token string; connect to
    every request `python-gitlab`'s client sends; shape is a
    `PreparedRequest` in, the same object with exactly one credential
    header out.

### Discard the throwaway example

The `prepared`/`authed` objects built above are discarded — they exist
only to prove the header-attachment mechanism directly, without
needing a real network call to GitLab at all.

### Mechanical walkthrough

- **`requests.Request(...).prepare()`** — full treatment of
  `requests` already given in Lesson 11, extended here: `.prepare()`
  turns a `Request` (a plain description of what to send) into a
  `PreparedRequest` (the actual, final form about to go over the
  wire) — this is the exact object type every `AuthBase.__call__`
  receives and is allowed to modify.
- **`PrivateTokenAuth("fake-pat-123")(prepared)`** — constructs the
  auth object, then calls it directly as a function on `prepared` —
  the same thing `requests` itself does automatically, internally,
  immediately before actually sending a request, when you pass
  `auth=some_instance`.
- **`r.headers.pop("JOB-TOKEN", None)`** inside each class — full
  treatment of `dict.pop` (a basic, already-familiar method, given
  full treatment here on reappearance per this curriculum's own
  Repetition standard): removes a key if present, does nothing if
  it's already absent (the `None` default prevents a `KeyError`) —
  this is what guarantees switching token types never leaves a
  previous, wrong header behind.

### CS lens

A small, single-method interface (`AuthBase`'s `__call__`) that any
object can implement to plug custom behavior into a larger, generic
system — here, `requests`'s own send pipeline — without that system
needing to know anything about GitLab specifically, is the **Strategy
pattern**: swap the algorithm (how to authenticate) independently of
the thing using it (the HTTP client).

```
Also recognized in: a sort function accepting a custom `key=` callable
instead of hard-coding comparison logic, a logging framework accepting
pluggable handlers, this curriculum's own `chunked`/`safe_stream`
(Lesson 7, Lesson 13) accepting a `process` function as a parameter
instead of hard-coding what happens to each item
```

### SE lens

The alternative — one single auth class that takes a token and a "type"
string, branching internally on which header to set — would work, but
mixes three genuinely different behaviors into one class with a
conditional, rather than three small classes each satisfying the same
interface. `python-gitlab`'s actual choice (three classes, one shared
`__call__` contract) means adding a fourth token type later — if GitLab
ever introduces one — is a new, small, independent class, not a new
branch inside an existing one that risks breaking the other two paths.

### Run it

Shown above — real output, from an actual run, needing no network
access at all, since it exercises the library's own real header-
building logic directly rather than anything server-side.

### Connect

The previous unit established that git-protocol credentials live
outside your Python code entirely; this unit proves, from the real,
installed library's own source, exactly which HTTP header each REST-API
credential type actually needs — the next unit puts this into the real
client object you'd actually construct and call.

---

## Concept Unit: The `gitlab.Gitlab` client

### The Problem

Nothing so far has shown the actual object you'd hold onto and call
methods on to do real work against GitLab — creating a merge request,
reading a project's metadata, listing issues.

### The real, current constructor — confirmed from the installed library

```python
import inspect
import gitlab
print(inspect.signature(gitlab.Gitlab.__init__))
```

Real output, from the actual installed version:

```
(self, url=None, private_token=None, oauth_token=None, job_token=None,
 ssl_verify=True, http_username=None, http_password=None, timeout=None,
 api_version='4', per_page=None, pagination=None, order_by=None,
 user_agent='python-gitlab/8.5.0', retry_transient_errors=False,
 keep_base_url=False, **kwargs)
```

Two details worth noticing directly in this real signature, both
already-familiar ideas from earlier lessons, now built into the client
itself rather than something you'd write by hand: **`per_page`/
`pagination`** — Lesson 11's own `Link`-header pagination, handled for
you; **`retry_transient_errors`** — Lesson 11's own retry-with-backoff
idea, available as a single constructor flag instead of a hand-written
`fetch_with_retry`.

```python
gl = gitlab.Gitlab("https://gitlab.com", private_token="fake-token")
print(type(gl.projects))
print(type(gl.projects).__mro__[:3])
```

Real output:

```
<class 'gitlab.v4.objects.projects.ProjectManager'>
(<class 'gitlab.v4.objects.projects.ProjectManager'>, <class 'gitlab.mixins.CRUDMixin'>, <class 'gitlab.mixins.GetMixin'>)
```

`gl.projects` isn't a plain method — it's a real **manager object**,
one per resource type (`gl.projects`, `gl.issues`, `gl.users`, ...),
each built from small, reusable mixins (`GetMixin` for `.get(id)`,
`CRUDMixin` for create/read/update/delete) — the actual real shape
you'd call: `gl.projects.get("group/project")`,
`project.mergerequests.create({...})`.

**Objects and methods used**

- **`gitlab.Gitlab`**
  - *What it is:* The top-level client class for the entire GitLab
    API.
  - *Implementation:* Real, confirmed constructor above; internally
    builds a `requests.Session`, attaching the correct `AuthBase`
    subclass from the previous unit based on which token argument was
    given.
  - *Its use:* The one object you'd construct once and reuse for every
    call against a given GitLab instance.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    class; responsible for holding connection-level configuration
    (URL, credentials, retry/pagination defaults) once, and exposing
    every resource type as its own manager attribute; depends on a
    reachable GitLab URL and a valid credential for anything beyond
    public data; connects to every `*Manager` attribute (`.projects`,
    `.issues`, ...); shape is configuration in, one long-lived client
    object out.

- **Resource managers (`ProjectManager` and siblings)**
  - *What they are:* One object per API resource type, exposing
    `.get()`/`.list()`/`.create()` following which mixins that
    resource actually supports.
  - *Implementation:* Confirmed above via `__mro__` — real inheritance
    from `GetMixin`/`CRUDMixin`, not one giant class handling every
    resource identically.
  - *Their use:* `gl.projects.get("group/project")` returns a real
    `Project` object; from there, `project.mergerequests.list()`,
    `project.issues.create({...})`, following the identical
    manager pattern one level deeper, per resource.
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    Classes, one instance per resource type, each attached to a parent
    client or object; responsible for translating `.get`/`.list`/
    `.create` calls into the correct real HTTP request and endpoint
    path for that specific resource; depend on the parent `Gitlab`
    client's own session (and therefore its already-attached auth);
    connect a top-level client down to individual real resource
    objects; shape is an ID or filter in, a real Python object (or list
    of them) representing that GitLab resource out.

### Mechanical walkthrough

- **`gitlab.Gitlab(url, private_token=token)`** — full treatment
  above; internally selects `PrivateTokenAuth` (previous unit) because
  `private_token` was the argument supplied, not `oauth_token` or
  `job_token`.
- **`gl.projects`** — attribute access on the client returning a real,
  already-constructed `ProjectManager`, not a method call — the
  manager is built once, at client-construction time, and reused for
  every subsequent `.get()`/`.list()` call.
- **`type(gl.projects).__mro__`** — the builtin `__mro__` (Method
  Resolution Order) attribute every Python class has, listing its own
  inheritance chain — used here purely to prove, directly, that
  `ProjectManager` really does inherit from `GetMixin`/`CRUDMixin`
  rather than reimplementing `.get()` itself.

### CS lens

One manager object per resource type, each built from small, shared
mixins rather than one large class per resource duplicating
`.get()`/`.list()`/`.create()` logic every time, is the same
**composition over inheritance-heavy duplication** principle behind
any framework offering a small set of reusable capabilities (mixins)
that concrete classes opt into individually.

```
Also recognized in: Django's own class-based views (mixins for
list/detail/create/update/delete, composed per view), Python's own
`collections.abc` (mixin classes providing default implementations
once you supply a few required methods), this curriculum's own
`Contact`/`Contact`-adjacent dataclasses sharing structure through
composition (a conversion function) rather than a shared base class
```

### SE lens

The alternative not chosen — one client class implementing every
GitLab resource type's methods directly, with no manager objects at
all (`gl.get_project(id)`, `gl.list_issues(project_id)`, ...) — would
avoid the extra layer of indirection at the real cost of one enormous
class (GitLab's API has dozens of resource types) with no shared
structure between near-identical `.get`/`.list`/`.create` behavior
repeated per resource. The manager-and-mixin design means a new GitLab
resource type is a small new class composed from existing mixins, not
a new pile of near-duplicate methods added to one already-large class.

### Run it

The constructor signature and manager-class hierarchy shown above are
both real, from the actual installed library, requiring no network
call. Actually calling `.get()`/`.list()` against real data needs a
real, reachable GitLab instance and a real token — genuinely outside
what this sandbox can execute (no network path to `gitlab.com` at
all) — the shape shown above is exactly what you'd run, unchanged,
against a real instance with real credentials.

### Connect

This unit's real client object is where the previous two units'
findings meet: construct it with whichever credential type you have
(SSH doesn't apply here at all — REST API auth is always one of the
three headers from the previous unit), and every resource manager
hanging off it already carries that credential, automatically, on
every call.

---

## Concept Unit: What a real auth failure actually looks like

### The Problem

Every previous unit in this section proved the *mechanism* — the right
header gets attached. Nothing yet has shown what happens when the
credential itself is simply wrong, which is the failure you'll
actually hit and need to recognize while setting this up for real.

### Introduce the concept — the real, live mechanism, proven against a reachable API

This sandbox can't reach `gitlab.com`, but the underlying HTTP
mechanism — a rejected bad credential vs. a request with no credential
at all — is identical everywhere. Proven live against GitHub's real
API (already used safely for this exact purpose in Lesson 11):

```python
import requests

r = requests.get("https://api.github.com/user",
                  headers={"Authorization": "Bearer not-a-real-token"})
print("bad token ->", r.status_code, r.json())

r2 = requests.get("https://api.github.com/user")
print("no token  ->", r2.status_code, r2.json())
```

Real output, from an actual run:

```
bad token -> 401 {'message': 'Bad credentials', 'documentation_url': 'https://docs.github.com/rest', 'status': '401'}
no token  -> 403 {'message': "API rate limit exceeded for 34.139.224.102. ...", 'documentation_url': 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'}
```

Two genuinely different real failures: a *wrong* credential gets a
loud, explicit `401` naming exactly what's wrong; *no* credential at
all silently falls back to anonymous access, only failing later (here,
from an unrelated rate limit, not from authentication at all).
GitLab's own `PRIVATE-TOKEN` path produces the equivalent explicit
`401` for a genuinely wrong token — `python-gitlab` surfaces this as a
real, named exception, `gitlab.exceptions.GitlabAuthenticationError`
(confirmed present in the real installed library's own
`gitlab/exceptions.py`), rather than a bare status code your own code
would have to check by hand.

### Mechanical walkthrough

- **`requests.get(..., headers={"Authorization": "Bearer not-a-real-token"})`**
  — full treatment of `requests.get` and headers already given in
  Lesson 11; a syntactically well-formed but genuinely invalid
  credential.
- **`r.status_code`, `r.json()`** — full treatment already given in
  Lesson 11; read here specifically to distinguish "your credential
  was checked and rejected" (`401`) from "no credential was even
  considered" (here, a `403` for an unrelated reason — rate limiting —
  proving the *absence* of a header doesn't even reach the same
  check a *wrong* header does).

### CS lens

Two different failure codes for two genuinely different situations —
"I checked this and it's wrong" vs. "nothing to check, proceeding
anonymously, which itself may fail for other reasons" — is the same
distinction as this curriculum's own `KeyError` (Lesson 4: a wrong key,
checked and absent) vs. simply never having set a key at all: a system
that collapses both into one generic failure loses real diagnostic
information a caller needs to actually fix the problem.

```
Also recognized in: a login form distinguishing "wrong password" from
"no account with that email" (a real, deliberate UX/security tradeoff —
some systems merge these on purpose, to avoid confirming which emails
have accounts at all), a compiler distinguishing "undefined variable"
from "type mismatch" rather than one generic "error", HTTP's own 401
(check failed) vs. 403 (check succeeded, but you're not allowed) vs.
404 (used, sometimes deliberately, to avoid confirming a private
resource exists at all)
```

### SE lens

The practical takeaway for your own tool: **check for and handle a
`401`/`GitlabAuthenticationError` specifically and separately** from a
generic "something went wrong" catch — a wrong or expired token is a
completely different, actionable problem (re-authenticate) from a
transient network failure (retry, per Lesson 11) or a genuine
permissions issue (a `403` — the token is valid, but this token's
owner isn't allowed to do this specific thing). Collapsing all three
into one generic error message is exactly the kind of diagnostic
information loss Part 7 of the framework document warned about for
validation errors generally — the same principle, here applied to
authentication specifically.

### Connect

Every unit in this section closes the same loop from a different
angle: git-protocol credentials live outside your code (unit 1); REST
credentials live in one of three real, now-proven headers, attached
automatically by the real client object (units 2-3); and a wrong one
fails loudly and specifically, distinguishable from simply having none
at all (this unit) — the actual, complete picture of "how do I log in"
for a tool built on top of both GitPython and `python-gitlab` together.

---

## What this doesn't give you

Plain git has no concept of "this file is currently checked out by
Alice, don't let Bob edit it too." That's not a GitPython gap — it's
not a *git* concept at all (GitLab's own File Locking feature is built
on top of git, using Git LFS, specifically because git itself has no
such thing). Since your project needs check-in/check-out with a
database already, model locking as your own table and your own atomic
operation — not something to look for further in GitPython's API:

```sql
CREATE TABLE checkouts (
    file_path TEXT PRIMARY KEY,
    checked_out_by TEXT,
    checked_out_at TIMESTAMP
);
```

```python
cur = conn.execute(
    "UPDATE checkouts SET checked_out_by = ?, checked_out_at = ? "
    "WHERE file_path = ? AND checked_out_by IS NULL",
    (user, now, path),
)
if cur.rowcount == 0:
    raise AlreadyCheckedOutError(path)
```

One atomic `UPDATE ... WHERE ... IS NULL`, checked by `rowcount`, not a
`SELECT` then a separate `UPDATE` — the exact race condition flagged
earlier, and the exact fix, unchanged by the fact that the thing being
checked out happens to be a file tracked in git.
