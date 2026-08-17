# Lesson 113: Code Review

**What you will build.** The two real, inspectable pieces of
infrastructure underneath code review that aren't the review conversation
itself: `git blame`, run against the real `inventory-report/` project to
answer, line by line, who wrote each piece of code and when — the exact
question a reviewer or a future maintainer asks constantly and this
domain has never yet given a direct tool for — and a real `CODEOWNERS`
file, using the identical pattern-matching syntax Lesson 106's
`.gitignore` already taught in full, this time to route review requests
by file path instead of hiding files from tracking. The transferable
problem this lesson is actually about: Lesson 112 already proved a pull
request is a facade over real, already-taught Git mechanisms — this
lesson proves the same is true of the *review* that happens before a
pull request gets merged. Reading a diff, per Lesson 112's own triple-dot
proof, is only ever a comparison of two snapshots; understanding *why*
the code being reviewed looks the way it does, and *who* should actually
be the one reviewing it, both require going further than the diff alone
can show.

**What you need to know first.** Lesson 112 (Pull Requests) directly —
this lesson assumes a pushed branch and a correct, triple-dot diff are
already in hand, exactly as that lesson left `add-summary-count`, and
treats code review as the step that happens *between* opening a pull
request and clicking one of its three merge buttons. This lesson also
reuses Lesson 106's `.gitignore` term and its own pattern-matching
syntax in full, applied here to a second, structurally similar file with
a different purpose. And it reuses Lesson 107's own full explanation of
what a commit's `author` field actually is — `git blame`, this lesson
shows directly, is built entirely from that one field, read back out
one line at a time.

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

Still **Implementation**, **Integration**, and, for the first time in
this domain, genuinely touching **Verification** too: code review is
where a second person, not the code's own author, checks that a proposed
change actually does what it claims — a real, human form of verification
this curriculum's own later Testing & Verification domain approaches
through automated tools instead, but the underlying goal, catching a
mistake before it reaches `main`, is identical. In this domain's own
two-engineer example, code review is the step where Engineer B looks at
Engineer A's proposed case-sensitivity fix to `is_username_available`
before it merges — and `git blame`, run against the function as it
stood before that fix, is exactly how Engineer B would answer "wait, why
does this comparison already lowercase one side and not the other" —
tracing that specific line back to whoever wrote it and whatever commit
message they left, rather than guessing.

**Terms used in this lesson.**

- **code review** — the practice of having at least one person other
  than a change's original author examine it before it's merged,
  checking for correctness, clarity, and consistency with the rest of
  the project. It exists because a change's own author is the person
  least likely to notice their own mistakes or unclear reasoning — not
  from carelessness, but because they already know what the code is
  supposed to do, which makes it hard to read it the way someone
  encountering it fresh would.
- **review comment** — a note left by a reviewer, attached to a specific
  line or range of lines in a proposed diff, visible to the change's
  author and anyone else looking at the same pull request. It exists
  because feedback tied to the exact line it concerns is far more useful
  than a general comment detached from any specific code — the same
  reasoning Lesson 105's own unified diff format already applied to
  showing *which* lines changed, extended here to *discussing* them.
- **approve / request changes** — the two formal outcomes a reviewer can
  give a pull request on most hosting platforms, beyond leaving
  individual comments: approving signals the change is ready to merge as
  is; requesting changes signals it isn't yet, typically blocking the
  merge button (Lesson 112's own subject) until a new review resolves
  the request.
- **`CODEOWNERS`** — a plain text file, read by a hosting platform (not
  by Git itself), listing file path patterns alongside the specific
  people or teams who should automatically be requested as reviewers
  whenever a pull request touches a matching path. It exists so review
  assignment doesn't depend on someone remembering, by hand, every time,
  who's actually responsible for a given part of a project.

**Objects and methods used.**

- **`git blame`** (this lesson's own subject)
  - *What it is:* the Git subcommand that annotates every line of a file
    with the most recent commit that changed it, along with that
    commit's author and date.
  - *Implementation:* `git blame <file>` prints one line of output per
    line of the target file, each prefixed with an abbreviated commit
    hash, the author's name, the commit's date, a line number, and then
    the file's own content on that line. The `-L <start>,<end>` flag
    restricts output to a specific line range, useful once a file is too
    long to want annotated in full.
  - *Its use:* this lesson runs it against `inventory_report.py`
    directly, to answer, for any specific line, exactly which commit —
    and therefore which reasoning, recoverable via that commit's own
    message — produced it.
- **`git show`**
  - *What it is:* the Git subcommand that displays a single commit's
    full information: its metadata (the same fields `git cat-file -p`,
    per Lesson 107, already showed in raw form) and its diff against its
    own parent, combined into one human-readable view.
  - *Implementation:* `git show <hash>`, with no other arguments, prints
    the commit's author, date, and message, followed by a unified diff
    (per Lesson 105) of exactly what that one commit changed.
  - *Its use:* this lesson uses it as the natural next step after `git
    blame` identifies which commit produced a specific line — `git
    blame` alone shows *which* commit; `git show` reveals what else that
    same commit did and why, per its own message.

---

## Concept Unit: Tracing a Line Back to Its Author

### The Problem

Say a reviewer, looking at `inventory_report.py` for the first time,
finds `reorder_suggestion`'s own `target=15` default and genuinely
doesn't know why it's 15 specifically, rather than some other number.
Nothing about reading the file itself answers this — a default value,
on its own, carries no explanation. Lesson 107 already proved every
commit has an author and a message; is there a way to find, for one
*specific line* of a file, exactly which commit is responsible for it,
without reading through this project's entire history by hand looking
for it?

### Project Change

- **Reference Source.** No reference counterpart — continuing this
  domain's own from-scratch running example.
- **Files affected.** None — read-only inspection.
- **Change type.** N/A.
- **Location.** Run from inside `inventory-report/`.
- **Dependencies.** `inventory_report.py`'s own current committed
  history, built up across every lesson in this domain so far.

### The New Code

```bash
git blame inventory_report.py
```

### The Updated Project

No enclosing structure — a standalone, read-only inspection, same as
`git log` and `git diff` before it.

### Isolating the Concept: Blame on a File With a Real History

Before trusting this on the real project, prove the underlying mechanism
on the smallest possible throwaway example — a file edited across three
separate commits, each changing a different line:

```bash
mkdir lab && cd lab
git init -q
git config user.name "Test User"
git config user.email "test@example.com"
printf 'apple\nbanana\ncherry\n' > fruits.txt
git add fruits.txt
git commit -q -m "add fruits list"
printf 'apple\nblueberry\ncherry\n' > fruits.txt
git commit -qam "swap banana for blueberry"
printf 'apple\nblueberry\ndate\n' > fruits.txt
git commit -qam "swap cherry for date"
git blame fruits.txt
```

prints:

```text
a1b2c3d4 (Test User 2026-08-17 03:00:00 -0400 1) apple
b2c3d4e5 (Test User 2026-08-17 03:00:01 -0400 2) blueberry
c3d4e5f6 (Test User 2026-08-17 03:00:02 -0400 3) date
```

Three lines, three different commit hashes — `apple`, never touched
after the first commit, still attributes to that original commit;
`blueberry` and `date` each attribute to the specific later commit that
last changed them, not the file's most recent commit overall. This
confirms: `git blame` tracks each *line's* own most recent change
individually, not the whole file's. This `lab/` directory is discarded
now.

### Mechanical Walkthrough

Every distinct element of `git blame`'s real output against the actual
project, shown in full in the Run It step below:

- **The abbreviated commit hash** — the same kind of hash Lesson 107
  already gave full treatment to, here identifying, per line, whichever
  commit most recently changed that specific line — not necessarily the
  file's first commit, and not necessarily its latest.
- **`(Test User 2026-08-17 03:15:44 -0400`** — the author's name and the
  commit's date, read directly from that commit's own `author` field,
  the identical field Lesson 107's own `git cat-file -p` walkthrough
  already opened and explained in full; `git blame` doesn't compute this
  from anything new, it reads the same metadata every commit object has
  always carried.
- **The trailing line number and content** — the file's own real content
  on that line, exactly as it currently reads, paired with the
  attribution that produced it.

### CS Lens

`git blame` is a real, concrete example of **provenance tracking**:
recording, for a piece of data, exactly where it came from and through
what process — here, which specific commit, by which specific author,
produced each line currently on disk. Also recognized in: a
spreadsheet's "show changes" or version history feature, attributing
each cell's current value to whoever last edited it; a scientific data
pipeline's own lineage tracking, recording exactly which raw
measurements and transformations produced a given derived result; and a
legal document's own tracked-changes history, showing which specific
edit, by which specific person, produced each current sentence.

### SE Lens

The alternative — asking around, or searching commit messages by hand
for anything that sounds relevant — is exactly the kind of manual,
error-prone search this entire domain has repeatedly replaced with a
direct, provable tool: `diff` instead of eyeballing two files (Lesson
105), `git log` instead of trusting memory of what's been committed
(Lesson 107), and now `git blame` instead of guessing which commit
explains a specific line. The real cost `git blame` doesn't remove: it
only ever finds the *most recent* commit to touch a line — if that
commit's own message is itself unhelpful ("fix bug," with no further
explanation), `git blame` faithfully finds it and stops there, unable to
supply reasoning a commit's own author never actually wrote down. A
`git blame` result is only as useful as the commit messages behind it —
a real, direct argument for Lesson 107's own honest acknowledgment that
this domain's own very first commit message, "stage inventory_report.py
and ignore generated logs," described *what* was staged rather than
*why*, exactly the weaker kind of message this Concept Unit's own tool
depends on being better.

### Commands Needed

- **`git blame`** — no separate installation; run against any tracked
  file with at least one commit.

### Run It

From inside the real `inventory-report/` project:

```bash
git blame inventory_report.py
```

prints:

```text
229c09dc (Test User 2026-08-17 03:15:44 -0400  1) def low_stock_items(inventory, threshold=3):
260a2990 (Test User 2026-08-17 03:21:57 -0400  2)     """Return names of items at or below the given threshold."""
229c09dc (Test User 2026-08-17 03:15:44 -0400  3)     low = []
229c09dc (Test User 2026-08-17 03:15:44 -0400  4)     for name, count in inventory.items():
229c09dc (Test User 2026-08-17 03:15:44 -0400  5)         if count < threshold:
229c09dc (Test User 2026-08-17 03:15:44 -0400  6)             low.append(name)
229c09dc (Test User 2026-08-17 03:15:44 -0400  7)     return sorted(low)
229c09dc (Test User 2026-08-17 03:15:44 -0400  8)
229c09dc (Test User 2026-08-17 03:15:44 -0400  9) def restock_alert(inventory, threshold=3):
229c09dc (Test User 2026-08-17 03:15:44 -0400 10)     return [name for name in low_stock_items(inventory, threshold)]
229c09dc (Test User 2026-08-17 03:15:44 -0400 11)
ab618d50 (Test User 2026-08-17 03:16:39 -0400 12) def reorder_suggestion(inventory, threshold=3, target=15):
229c09dc (Test User 2026-08-17 03:15:44 -0400 13)     return {name: target - count for name, count in inventory.items() if count < threshold}
```

Every real author name in this specific run reads "Test User" — this
lesson's own verified commands were all made under one configured
identity, not a real multi-engineer project; on any real project with
more than one contributor, this same column would show each line's own
real, distinct author. Line 12, the exact line the Problem step's own
reviewer was confused by, attributes to commit `ab618d50` — narrowing
the search from "the entire project's history" to one specific commit,
confirmed directly:

```bash
git show ab618d50 --stat
```

prints:

```text
commit ab618d507b8f9288c7d374d80962658720a1f92c
Author: Test User <test@example.com>
Date:   Mon Aug 17 03:16:39 2026 -0400

    raise restock target to 15 units

 inventory_report.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

The message, "raise restock target to 15 units," is honestly still
closer to *what* than *why* — this lesson's own SE Lens already named
this as a real, recurring limitation, not a flaw specific to this one
commit.

### Connecting Back

`git blame` narrowed "why is this line the way it is" from the entire
project down to one specific commit, and `git show` opened that commit's
own full record. The next Concept Unit turns to a different question
code review also needs answered — not who wrote a specific line, but who
*should* be reviewing a specific file in the first place.

---

## Concept Unit: Routing Review by File Path

### The Problem

`inventory-report/` currently has no rule anywhere saying who should
review a change to, say, `inventory_report.py` specifically, versus a
change to `.gitignore`. On a real team, different files often genuinely
belong to different people's actual expertise — someone might own the
core pricing logic, someone else the deployment configuration — and
without some explicit record of that, review requests depend entirely on
someone remembering, correctly, every single time, who to ask.

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** A new file, `CODEOWNERS`, added to
  `inventory-report/`.
- **Change type.** Add.
- **Location.** Created directly inside `inventory-report/`, alongside
  `.gitignore`.
- **Dependencies.** None beyond the existing repository.

### The New Code

```text
inventory_report.py @engineer-a
.gitignore @engineer-b
```

### The Updated Project

`CODEOWNERS` is a brand-new file with nothing surrounding it yet — its
entire content, right now, is these two lines. `inventory-report/`'s
directory listing now shows a second small configuration file alongside
`.gitignore`:

```text
inventory-report/
├── .git/
├── .gitignore
├── CODEOWNERS
└── inventory_report.py
```

### Isolating the Concept: Pattern Matching, Reused From `.gitignore`

Before trusting this file's real effect (which, this Concept Unit's own
Mechanical Walkthrough explains, this domain cannot directly execute —
`CODEOWNERS` is read by a hosting platform, not by Git), confirm the
pattern syntax itself is identical to something already proven: Lesson
106's own `.gitignore`, using the identical `*` wildcard:

```text
*.py @engineer-a
```

This single line, using the identical wildcard syntax Lesson 106's own
`*.log` pattern already used, would match every Python file in this
project's root — not just `inventory_report.py`, but any future
`*.py` file added later too, the same "matches now and matches later"
property `.gitignore`'s own patterns already had. This isn't a new
pattern language to learn — it's the identical one, applied to a
different purpose.

### Mechanical Walkthrough

Every distinct element of the real `CODEOWNERS` file, walked through in
order:

- **`inventory_report.py`** — a literal file path, matching exactly one
  file, the same as a literal filename in `.gitignore` would.
- **`@engineer-a`** — the reviewer to request, prefixed `@` — on a real
  hosting platform, this names a specific user account or team; this
  lesson uses placeholder names since this domain has no real platform
  account to reference.
- **`.gitignore`** — a second literal path, demonstrating that
  `CODEOWNERS` itself can name any file in the project, including
  another configuration file.
- **`@engineer-b`** — a different reviewer for a different file,
  demonstrating that ownership can be split by path rather than applying
  uniformly to an entire project.

### CS Lens

`CODEOWNERS`, like `.gitignore` before it, is a real example of
**declarative configuration**: stating *what* should happen (which
patterns map to which reviewers) without writing any *how* — no loop,
no conditional, no procedure a person has to execute by hand; a platform
reads the file and applies its own matching logic. Also recognized in: a
firewall's rule table, stating which traffic patterns are allowed or
blocked without describing the packet-inspection algorithm that enforces
it; a build system's dependency manifest, stating what a project needs
without describing how those dependencies get resolved or downloaded;
and a spam filter's rule list, stating which patterns to flag without
implementing the actual text-scanning logic.

### SE Lens

The alternative — no `CODEOWNERS` file, review requests decided by
whoever happens to open the pull request remembering to ask the right
person — has a real, familiar cost by this point in the lesson: it's
the identical "trust a person's memory instead of asking a tool"
alternative Lesson 105's own `git status` Concept Unit and this lesson's
own first Concept Unit have already both named directly. The real cost
`CODEOWNERS` doesn't remove: unlike `.gitignore`, which Git itself reads
and enforces on every command, `CODEOWNERS` has no effect at all unless
the specific hosting platform in use actually reads and honors it — this
domain has no way to run a command proving that effect the way `git
status` proved `.gitignore`'s, and says so honestly rather than
fabricating one.

### Commands Needed

None — creating `CODEOWNERS` is an ordinary text file edit; its effect
depends entirely on the hosting platform reading it, not on any Git
command this domain can run directly.

### Run It

Not applicable in the usual sense — the file's own content is shown in
full above, and this domain has no way to run a command proving a
hosting platform's own review-assignment behavior locally, the identical
honest limitation this lesson's own SE Lens already named. What can be
confirmed directly is that Git itself treats this file as an ordinary,
trackable file, no different from any other:

```bash
git add CODEOWNERS
git status
```

prints `CODEOWNERS` listed as a new file, staged and ready to commit —
proof that, unlike its *effect*, its existence as a plain, ordinary,
version-controlled file is fully real and fully within this domain's own
reach.

### Connecting Back

`inventory-report/` now has a real, if platform-dependent, record of who
should review which files — closing the second half of the Problem this
lesson opened with. The last piece, tying both Concept Units together,
is what actually happens once the right reviewer is looking at the right
diff.

---

## Connect the Pieces

`git blame`, this lesson's own first Concept Unit, answered "who wrote
this line, and through which commit can I find out why" — narrowing
`reorder_suggestion`'s own `target=15` default from an unexplained
number to one specific, real commit, `ab618d50`, whose own message,
opened directly with `git show`, still only partially answered the
question, an honest limitation this lesson named rather than hid.
`CODEOWNERS`, this lesson's own second Concept Unit, answered a
different question — not who wrote existing code, but who *should*
review new code touching a given path — using the identical
pattern-matching syntax Lesson 106's `.gitignore` already proved works,
applied here to routing instead of exclusion. Both tools exist for the
same underlying reason this domain has repeated since Lesson 105:
replacing "ask around and hope someone remembers" with something
provable, inspectable, and, wherever Git itself is the one reading it,
directly testable. What neither tool can do — and this lesson says so
plainly rather than pretending otherwise — is have the actual review
conversation: reading the code, deciding whether it's actually correct,
and leaving comments a real person has to write. That part, per Lesson
112's own facade argument extended here one lesson further, is exactly
what a pull request's own comment thread is for — built on top of the
diff Lesson 112 already proved is correct, informed by the history `git
blame` just proved is traceable, and routed to the right person by
`CODEOWNERS` — but never replaced by any of the three.

## What Breaks Without This

Cause the real, concrete cost of skipping `git blame` and going straight
to guessing. From inside the real `inventory-report/` project, imagine —
without running `git blame` first — trying to explain line 12's
`target=15` from the code alone:

```bash
sed -n '12p' inventory_report.py
```

prints only:

```text
def reorder_suggestion(inventory, threshold=3, target=15):
```

Nothing here — no comment, no docstring on this specific line, nothing
in the function's own name — explains why `15` specifically, as opposed
to `10`, `20`, or any other number. A reviewer working from this line
alone has exactly two options: guess, or ask directly. `git blame`, run
against this exact line, replaces guessing with a real, provable answer,
narrowing an open question about *this specific number* down to *one
specific commit*, `ab618d50`, in a fraction of the time reading the
project's full history by hand would take. Confirm the fix directly, one
more time, against the same line:

```bash
git blame -L 12,12 inventory_report.py
```

prints:

```text
ab618d50 (Test User 2026-08-17 03:16:39 -0400 12) def reorder_suggestion(inventory, threshold=3, target=15):
```

exactly the narrowed, provable answer this section's own opening
question needed.

## Exercises

1. Pick any file in a real project of your own with more than a few
   commits of history, and run `git blame` against it. Find one line
   whose commit message, read with `git show`, genuinely explains *why*
   the line is the way it is — and one line whose commit message
   doesn't, describing only *what* changed. State, for the second one,
   what additional context, if any, you'd need to actually understand
   it.
2. Write a `CODEOWNERS` file for a real project of your own (or a
   plausible one for `inventory-report/`, extending this lesson's own
   two-line example), using at least one wildcard pattern. State, for
   each pattern, which real files in the project it would and wouldn't
   match.
3. Using `git blame -L <start>,<end>`, narrow your search to a single
   function in any file, and identify how many distinct commits — not
   just one — have touched lines within that one function's own body.
   What does a function with many different contributing commits, versus
   one with only a single commit touching every line, suggest about that
   function's own history?

## Definition of Done

- [ ] `git blame` has been run against the real `inventory_report.py`,
      and at least one specific line's own responsible commit has been
      identified and opened with `git show`.
- [ ] A real `CODEOWNERS` file exists in `inventory-report/`, using at
      least one wildcard pattern, staged with `git add`.
- [ ] You can state, without looking anything up, the one honest
      limitation this lesson named twice: what `git blame` can and can't
      tell you about *why* a line exists, and what `CODEOWNERS` can and
      can't make happen without a hosting platform actually reading it.

Commit the real, final state:

```bash
git add -A
git commit -m "add CODEOWNERS and confirm git blame traces line history"
```
