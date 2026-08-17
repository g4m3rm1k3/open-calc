# Lesson 105: Why Version Control Exists

**What you will build.** A real project directory, `inventory-report/`,
turned into an actual Git repository — not by copying a folder and
renaming it "final," but by creating the hidden metadata store Git uses
to track every change to that project from this point forward. Along the
way you'll feel, on purpose, exactly the two failures that manual
copy-based "versioning" causes — losing track of what actually changed
between two files, and having no shared source of truth when more than
one person edits the same project — before fixing the first one with a
real comparison tool and starting the fix for the second with Git
itself. The transferable problem this lesson is actually about: every
single lesson in this curriculum since Lesson 1 has ended its Definition
of Done with an instruction to run a `git commit` — a command you've been
typing on faith for 104 lessons without ever being told what it actually
does, what it's stored, or why that particular ritual was worth
repeating every single time. This domain is where that finally gets
explained, starting here with the specific pain the whole tool exists to
remove.

**What you need to know first.** Nothing from this curriculum's own
running project code — this domain starts a fresh, self-contained running
example, `inventory-report/`, the same way Domain 7 (Implementation
Engineering) started `pricing.py` from scratch rather than reconstructing
an unseen prior domain's exact file state. What this lesson does reuse,
conceptually: Lesson 104 (Engineering Conventions) closed Domain 7 by
naming consistent, deliberate, honestly-tradeoffed, revisable choices as
the throughline underneath everything that lesson's own eleven prior
lessons did — version control is the piece of infrastructure that makes a
team-wide convention like that one actually enforceable and inspectable,
instead of a rule people are just supposed to remember. This lesson also
assumes ordinary command-line fluency — typing a program's name at a
prompt and reading what it prints back — which every prior domain's own
"Run It" steps have already had you doing.

**Pipeline diagram.** This curriculum has established one named
multi-stage pipeline so far — the seventeen-stage software lifecycle,
first given in full in Lesson 12:

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

This lesson, and this domain generally, sits at **Implementation** and
**Integration** — Version Control & Collaboration is the domain that
governs how one person's implementation work gets recorded, and how more
than one person's implementation work gets combined without one silently
erasing the other. Lesson 12 walked one concrete literal value across
several of these stages, using only what Domain 1 had built at the time:
`is_username_available`, tested against the literal usernames `"dave"`
and `"alice"`. That walk reached **Problem** ("can two people register
conflicting accounts"), **Requirements** ("say whether it's available"),
**Specification** (does `"Dave"` collide with `"dave"`?), **Implementation**
(the three-line function itself), **Verification** (running it by hand
against `"dave"` and `"alice"`), **Architecture / Design** (the function
living inside `accounts.py`, with a formal boundary to `growth_signup.py`),
and **Operations / Observation** (an on-call engineer paged at 3 a.m.) —
and it honestly stopped there for **Integration**, never placing this
example on that stage, because Domain 1 never had two people editing
`accounts.py` at once. This lesson extends that same value onto exactly
the stage Lesson 12 left open: imagine a second engineer, working at the
same time as whoever wrote `is_username_available`, independently fixing
that exact case-sensitivity gap Lesson 12 named — while a first engineer
is separately adding the on-call logging Lesson 12's own 3 a.m. story
implied someone eventually had to write. Two people, one function, two
honest changes, made at the same time. **Integration** is the name for
the stage where those two changes have to become one piece of code
without either one quietly vanishing — which is precisely the problem
this entire domain, starting with this lesson, exists to solve.

**Terms used in this lesson.**

- **version control (system)** — a tool that records the history of
  changes to a set of files over time, so any prior state can be
  recovered and more than one person's changes can be combined without
  one silently overwriting another. It exists because neither of those
  two things is true of an ordinary folder of files on their own — a
  folder only ever holds whatever is currently written to disk, with no
  memory of what used to be there or who changed what.
- **repository ("repo")** — a directory that a version control system is
  actively tracking: the ordinary files a person edits, plus a separate,
  hidden store of that directory's entire recorded history. The word
  exists to distinguish "a folder of files" (no history, no tracking)
  from "a folder of files whose past states are recoverable."
- **working directory / working tree** — the actual files on disk, exactly
  as they'd look to a file browser or a text editor with no awareness of
  version control at all. This term exists to distinguish what you can
  currently see and edit from whatever history a version control system
  is separately keeping about it — a distinction that matters the moment
  those two things can disagree, starting in the very next lesson.
- **diff** — the specific set of line-by-line differences between two
  versions of the same text. The word names both the differences
  themselves ("look at the diff") and, lowercase and unhyphenated, the
  program that computes them. It exists because two similar files placed
  side by side and read by eye do not scale: a real change buried in a
  200-line file is easy to miss entirely, and even a spotted change is
  slow and error-prone to describe precisely by hand.
- **unified diff format** — the specific textual notation the `diff`
  program's `-u` flag produces (and, starting in Lesson 106, the notation
  Git itself uses for the same purpose): a two-line header naming the two
  files being compared, followed by one or more hunks, each hunk showing
  a few lines of unchanged context around every actual change. It exists
  so a diff's output is precise enough to be re-applied mechanically by
  another program, not just read by a human — a property this lesson
  does not yet use but the next several will.
- **hunk** — one contiguous block of changed lines, plus a small amount of
  unchanged context immediately before and after it, inside a unified
  diff. A single diff can contain several hunks if a file's changes are
  scattered across widely separated lines; the term exists because "the
  diff" and "one contiguous changed region within the diff" are different
  things once a file has more than one such region.
- **`.git` directory / repository metadata store** — the actual hidden
  folder, named `.git`, that Git creates inside a project the moment it
  becomes a repository. It exists as the literal location where every
  piece of history Git ever records about a project is stored — nothing
  about the project's own ordinary files changes when it's created; only
  this one new, separate folder appears.
- **subcommand** — the first word typed after `git` on a command line
  (`init`, `status`, and, starting in Lesson 107, `commit`) that selects
  which of Git's many distinct behaviors actually runs. The term exists
  because `git` itself is a single installed program, not one command per
  behavior — the same way one calculator can add, subtract, and multiply
  depending on which button is pressed, one `git` program does entirely
  different things depending on which word follows it.
- **tracked / untracked file** — a file's status with respect to a
  specific Git repository: *tracked* means Git has been told, at least
  once, to include this file in the project's recorded history; *untracked*
  means Git can see the file sitting in the working directory but has
  never been told to include it in that history. The distinction exists
  because creating a repository does not automatically enroll every file
  already sitting in that folder — a deliberate design choice this lesson
  observes directly and Lesson 106 (Versioned State) explains the reasoning
  behind.

**Objects and methods used.**

- **`diff`** (this lesson's own subject)
  - *What it is:* an external command-line program — a separate,
    standalone piece of software, part of the GNU `diffutils` package,
    invoked as its own operating-system process rather than called as a
    function inside any programming language. On Linux and macOS it is
    normally already installed; on Windows it ships as part of Git for
    Windows (which also provides the `git` program this lesson goes on
    to use) or the Windows Subsystem for Linux.
  - *Implementation:* invoked as `diff [options] file1 file2`. The `-u`
    flag selects unified output format (the default format, with no
    flag, is harder to read and this curriculum does not use it). Exit
    status `0` means the two files are identical; `1` means they differ;
    `2` means an error occurred, such as one of the two files not
    existing.
  - *Its use:* this lesson reaches for it as the "by hand" tool a person
    would use to answer "what actually changed between these two files"
    before any real version control system existed to answer that
    question automatically.
- **`git`**
  - *What it is:* a single external command-line program — the version
    control system this domain teaches concepts through, chosen because
    it is by far the most widely used version control tool in real
    software teams today, while every concept this domain names
    (commits, branches, merging, conflict resolution) exists in other
    version control systems too, under the same or very similar names.
  - *Implementation:* installed once per machine; every actual behavior
    is selected by the subcommand that follows it on the command line
    (`git init`, `git status`, and many more introduced across this
    domain). Running `git --version` prints the installed version, for
    example `git version 2.45.1`; the exact version varies installation
    to installation and does not affect any concept this domain teaches.
  - *Its use:* every remaining Concept Unit in this lesson, and every
    lesson in this domain, is built around one `git` subcommand or
    another.
- **`git init`**
  - *What it is:* the specific Git subcommand that turns an ordinary
    directory into a Git repository.
  - *Implementation:* `git init` (run with no arguments, from inside the
    directory you want to become a repository) creates a new `.git`
    subdirectory there, containing everything Git needs to start
    recording history: a `HEAD` file, a `config` file, a `description`
    file, and empty `hooks/`, `info/`, `objects/`, and `refs/`
    subdirectories. It prints one confirmation line to say where it put
    that new directory and exits successfully; run again in a directory
    that's already a repository, it leaves the existing `.git` directory
    untouched and reports that the repository already exists.
  - *Its use:* this is the literal first step of turning any project — a
    brand-new one or one that's existed for years without version
    control — into something Git can track.
- **`git status`**
  - *What it is:* the specific Git subcommand that reports the current
    state of a repository's working directory compared to what Git has
    actually recorded about it.
  - *Implementation:* `git status` (no arguments) prints which branch the
    repository is currently on, whether any commits exist yet, and,
    critically for this lesson, which files in the working directory
    Git considers tracked versus untracked, and which tracked files have
    been modified since they were last recorded. It reads the repository's
    own state; it never changes anything.
  - *Its use:* this lesson runs it twice — once against an empty
    repository, once after adding a real file — specifically to observe
    that creating a repository and adding a file to that repository's
    working directory are two separate acts, neither of which
    automatically does the other.

---

## Concept Unit: Comparing Two Versions by Hand

### The Problem

Picture the situation this whole domain exists to fix, before any tool
fixes it. You've written a small script, `inventory_report.py`, that
scans a store's inventory and flags anything running low:

```python
def low_stock_items(inventory, threshold=5):
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return low
```

A coworker emails you a zip file containing their own improved copy —
they lowered the default threshold and made the output sorted for
readability — and, following the only "versioning" system your team has
ever used, you save it next to the original under a new name so you
don't lose either one: `inventory_report_v2_FINAL.py`. Now you have two
files. Your coworker's email says "made a couple small tweaks," and
nothing more specific than that. Before you can safely adopt their
version — before you can even tell your manager what actually changed —
you have to answer a question neither file, on its own, can answer:
*exactly* what is different between these two files, line by line? For a
five-line function you could probably eyeball it. Real project files run
to hundreds of lines, and a one-character change (`threshold=5` becoming
`threshold=3`) is exactly the kind of thing eyes reliably miss when
scanning two open windows side by side.

### Project Change

- **Reference Source.** No reference counterpart — this is a from-scratch
  addition, starting this domain's own running example, `inventory-report/`,
  the same deliberate choice Domain 7 made when it started `pricing.py`
  from scratch rather than reconstructing a prior domain's unseen file
  state. This domain's own running example does the same for the
  identical reason: reconstructing exactly what an unseen, unread lesson
  left behind risks fabricating code that was never actually verified.
- **Files affected.** Two new files, created for this Concept Unit only
  and not carried forward into the rest of the lesson:
  `inventory_report_v1.py` and `inventory_report_v2_FINAL.py`, simulating
  the "manual copy" state described above.
- **Change type.** Add — both files are newly created.
- **Location.** A fresh, empty project folder; nothing exists yet to
  locate a position within.
- **Dependencies.** A working installation of the `diff` program,
  available by default on Linux and macOS, and via Git for Windows or
  WSL on Windows.

### The New Code

Type the command that answers the question the Problem step above asked
— what, precisely, changed between the two files:

```bash
diff -u inventory_report_v1.py inventory_report_v2_FINAL.py
```

### The Updated Project

This command has no "enclosing structure" to return to — it's a
standalone terminal invocation against two already-complete files, not a
fragment being inserted into a larger one. Running it is covered directly
by the Run It step, below, once the surrounding steps have explained what
its output actually means.

### Isolating the Concept: Unified Diff Output

Before reading `diff`'s real output against the two inventory files
above, see the exact same format on the smallest possible input — two
three-line text files differing by exactly one word. Throwaway files,
unrelated to the project:

```bash
printf 'apple\nbanana\ncherry\n' > a.txt
printf 'apple\nblueberry\ncherry\n' > b.txt
diff -u a.txt b.txt
```

Running this prints:

```text
--- a.txt	2026-08-17 02:47:04.114226700 -0400
+++ b.txt	2026-08-17 02:47:04.115228800 -0400
@@ -1,3 +1,3 @@
 apple
-banana
+blueberry
 cherry
```

This is called a **unified diff**, and every part of it directly mirrors
what the real command against `inventory_report_v1.py` and
`inventory_report_v2_FINAL.py` produces below, just with fewer lines to
find: one line was replaced (`banana` → `blueberry`), and the two
unchanged lines around it (`apple`, `cherry`) appear too, as context,
even though neither one differs. `a.txt` and `b.txt`, along with this
output, are discarded now and will not appear again in this lesson or
this project — they existed only to make the notation easy to read once,
on the smallest possible example, before meeting it on real code.

### Mechanical Walkthrough

Every distinct element of `diff -u inventory_report_v1.py
inventory_report_v2_FINAL.py` and its real output, in order:

- **`diff`** — the program being invoked. It is not a function inside
  any programming language and not a keyword; it's a separate,
  independently installed piece of software that this command starts as
  its own operating-system process, reads both file arguments, computes
  their differences internally, prints the result to the terminal, and
  exits.
- **`-u`** — a flag (a command-line option, prefixed with a dash,
  distinguished from `diff`'s two file arguments by that prefix)
  selecting *unified* output format specifically. `diff` supports other,
  older output formats by default; unified format was chosen for this
  domain because it's the same format Git itself uses for every diff it
  ever shows, starting in the very next lesson — learning it once here
  means never learning a second notation later.
- **`inventory_report_v1.py`** — the first positional argument: the "old"
  file, treated as the baseline everything else is compared against.
- **`inventory_report_v2_FINAL.py`** — the second positional argument:
  the "new" file, treated as the version being compared to the baseline.
  Swapping the order of these two arguments would still show every real
  difference, but would print every changed line's `-` and `+` reversed —
  the tool has no independent way to know which file is "older"; it only
  knows the order it was told.
- **`--- inventory_report_v1.py	<timestamp>`** — the first header line,
  always prefixed `---`, naming the old file and the exact time it was
  last modified on disk. Real timings like this vary machine to machine
  and run to run; the three-dash prefix and the filename it labels are
  what actually matters, not the specific timestamp shown.
- **`+++ inventory_report_v2_FINAL.py	<timestamp>`** — the matching
  header line for the new file, always prefixed `+++`, following the same
  reasoning as the `---` line above it.
- **`@@ -1,6 +1,6 @@`** — the hunk header for the real inventory-file
  diff below. `-1,6` means: starting at line 1 of the old file, this hunk
  covers 6 lines of it. `+1,6` means the same for the new file: starting
  at line 1, covering 6 lines. This pair of numbers exists so a tool
  re-applying this diff (or a person reading it) knows exactly where in
  each file the following lines belong, without having to search for
  them.
- **A line prefixed with a single space** — an unchanged context line,
  present in both files, shown so a reader (or a re-applying tool) can
  see exactly where the real change sits relative to code that didn't
  move.
- **A line prefixed `-`** — a line present in the old file and absent
  from the new one: something removed.
- **A line prefixed `+`** — a line present in the new file and absent
  from the old one: something added. A single-line edit, like
  `threshold=5` becoming `threshold=3`, is represented as one `-` line
  immediately followed by one `+` line, not as some third "changed" marker
  — unified diff format has no concept of "the same line, edited"; every
  change is expressed purely as a removal plus an addition, even when a
  human would describe it as one small edit to one line.

### CS Lens

Computing the smallest possible set of `-`/`+` lines that turns one file
into another is a real, named computer science problem: finding an
optimal **edit script** between two sequences, closely related to the
**longest common subsequence** problem (find the longest sequence of
lines that appears, in order, in both files — everything not in that
shared subsequence is what gets marked as removed or added). This isn't
a vague resemblance; it's the actual algorithm `diff` runs internally.
Also recognized in: every version control system's own diff and merge
machinery, `.patch`/`.diff` files used to distribute code changes without
distributing the whole project, "track changes" and "compare documents"
features in word processors, DNA and protein sequence alignment in
bioinformatics (finding the longest matching subsequence between two
genetic sequences), and spell-checkers and autocorrect systems that use
edit-distance calculations built on the same underlying idea.

### SE Lens

The alternative to a dedicated comparison tool is exactly what the
Problem step opened with: two people reading two files side by side and
trying to spot every difference by eye. That alternative doesn't scale —
not because it's impossible on a five-line function, but because its
cost grows with file size and change count while a computed diff's cost
does not; a 3,000-line file with one changed line costs `diff` the same
attention it costs on a 6-line file. This is the same distinction this
curriculum has already named in full: essential complexity — the
comparison itself genuinely has to happen, there's no version of this
task that skips it — versus accidental complexity, the specific pain of
doing that comparison by staring at two windows, which is not required
by the task itself, only by the choice to do it manually. `diff` doesn't
remove the essential complexity (something still has to determine what
changed); it removes the accidental complexity of a human doing that
determination by hand. The real cost this tool doesn't remove: `diff`
only compares two files you already have on disk, by name, at the moment
you run it — it has no memory of *why* a change was made, no way to
combine two people's simultaneous edits into one file, and nothing at
all to say about a file that only one of two people even has a copy of.
Those three gaps are exactly what the rest of this lesson, and this
domain, exist to close.

### Commands Needed

- **`diff`** — install status varies by platform. On Linux or macOS, it's
  already present; running `diff --version` prints a version string
  confirming this. On Windows, install Git for Windows (which also
  installs `git`, needed for the rest of this lesson) or the Windows
  Subsystem for Linux, either of which provides a working `diff`.

### Run It

Running the real command against the two inventory-report files:

```bash
diff -u inventory_report_v1.py inventory_report_v2_FINAL.py
```

prints:

```text
--- inventory_report_v1.py	2026-08-17 02:46:57.048552200 -0400
+++ inventory_report_v2_FINAL.py	2026-08-17 02:46:58.229673600 -0400
@@ -1,6 +1,6 @@
-def low_stock_items(inventory, threshold=5):
-    low = []
-    for name, count in inventory.items():
-        if count < threshold:
-            low.append(name)
-    return low
+def low_stock_items(inventory, threshold=3):
+    low = []
+    for name, count in inventory.items():
+        if count < threshold:
+            low.append(name)
+    return sorted(low)
```

Every line of the function shows as removed and re-added, because
`diff` compares whole lines: even though only the `threshold` value and
the final `return` line actually changed, the lines between them shifted
their meaning as a block, and `diff`'s line-based comparison has no
finer-grained way to say "these three middle lines are identical" once
the lines around them differ — a real limitation worth noticing here,
not a bug in this specific run. The real timestamps shown will differ
from these exact values on any other machine or any other run; that
detail is expected and unimportant. What matters is legible from the
`-`/`+` lines alone: the threshold tightened from 5 to 3, and the result
is now sorted before being returned.

### Connecting Back

`diff` answers the exact question the Problem step posed — precisely
what changed between two files — without a person reading two windows by
eye. It does not, on its own, answer the two questions still open: which
of these two files is the project's real, current version going forward,
and what happens when a change like this needs to be combined with a
second, different change made by someone else at the same time. Both are
what the next two Concept Units start to address.

---

## Concept Unit: Turning a Project Into a Repository

### The Problem

`diff` fixed one specific pain — comparing two files that already exist.
It did nothing about how those two files came to exist in the first
place: a person, manually, decided to make a copy before editing,
named it something like `_v2_FINAL`, and hoped everyone involved agreed
on which copy was current. Nothing enforces that agreement. Nothing
stops a third copy, a fourth, or a coworker overwriting the "final" one
with their own different final one. And nothing at all remembers *why*
any specific change was made, or lets you recover a version from three
weeks ago if the only copy of it was the one somebody has since
overwritten. The real project this lesson builds, `inventory-report/`,
currently exists as a single ordinary folder with a single ordinary file
in it — exactly as vulnerable to all of this as the two-file mess above,
just one accident away from needing it.

### Project Change

- **Reference Source.** No reference counterpart — this is the
  from-scratch start of this domain's real running project.
- **Files affected.** A new directory, `inventory-report/`, containing
  one new file, `inventory_report.py`:

  ```python
  def low_stock_items(inventory, threshold=5):
      low = []
      for name, count in inventory.items():
          if count < threshold:
              low.append(name)
      return low
  ```

  This is deliberately the same function the previous Concept Unit's
  `inventory_report_v1.py` used, restated here as the real project's own
  starting point — the manual-copy files from that unit are gone; this
  is the one file this domain's actual running example begins from.
- **Change type.** Add — a brand-new directory and file.
- **Location.** N/A; nothing exists yet to locate a position within.
- **Dependencies.** A working installation of Git. Running `git --version`
  should print something like `git version 2.45.1` — the exact numbers
  after `version` vary by installation and don't matter for anything this
  domain teaches.

### The New Code

Type the command that turns this ordinary directory into a Git
repository, run from inside `inventory-report/`:

```bash
git init
```

### The Updated Project

There's no larger enclosing structure to place this inside — turning a
directory into a repository is, itself, the entire change; nothing about
`inventory_report.py` is touched at all. What *does* change is something
new appearing alongside it: a hidden `.git` directory, sitting next to
`inventory_report.py` in the same folder, containing everything Git will
ever need to track this project's history from this point forward. A
directory listing of `inventory-report/` immediately after running this
command shows both:

```text
inventory-report/
├── .git/
└── inventory_report.py
```

`inventory_report.py`'s own contents are completely unaffected — this
step only adds the `.git/` directory next to it.

### Isolating the Concept: What `git init` Actually Creates

Before trusting that `.git/` is real and not just a name printed to the
terminal, run `git init` in a small, empty, throwaway directory and look
inside the folder it creates — the exact same command just used on the
real `inventory-report/` project above, isolated on nothing but an empty
folder so there's nothing else to look at:

```bash
mkdir lab && cd lab
git init
ls -a
ls .git
```

Running this prints (the exact path Git reports will reflect wherever
you actually ran the command, not the one shown here):

```text
Initialized empty Git repository in /path/to/lab/.git/
.
..
.git
HEAD
config
description
hooks
info
objects
refs
```

This confirms, concretely, what the previous step only described: `.git`
is a real directory Git created on disk, containing a `HEAD` file, a
`config` file, a `description` file, and the `hooks/`, `info/`,
`objects/`, and `refs/` subdirectories that later lessons in this domain
will start actually using — `objects/` starting in Lesson 106, `refs/`
starting in Lesson 108. This `lab/` directory and everything inside it —
including its own `.git/` — is now discarded and will not appear again;
the real `inventory-report/`'s own `.git/` directory, created moments ago
by the identical command, is what the rest of this lesson and domain
build on.

### Mechanical Walkthrough

Every distinct element of `git init`, in order:

- **`git`** — the single external program this entire domain is built
  around. Like `diff`, it's a separate, independently installed piece of
  software, not a language keyword or a built-in shell command; running
  it starts a new operating-system process that reads whatever arguments
  follow it, does whatever work those arguments select, and exits.
- **`init`** — the subcommand: the specific word telling the single `git`
  program which of its many behaviors to run right now. Git has dozens of
  subcommands; `init` selects exactly one of them — the one that creates
  a new repository. No flags or file arguments are given here, so `init`
  operates on the current directory, the one the terminal is already
  inside when the command runs.
- **`Initialized empty Git repository in <path>/.git/`** — the single
  line `git init` prints on success, confirming both that it worked and
  exactly where it put the new `.git` directory. "Empty" here means no
  commits exist in it yet, not that the directory itself is empty — the
  isolated lab above shows it already contains several real files and
  subdirectories the moment it's created.

### CS Lens

A `.git` directory is an example of a system keeping its own metadata
completely separate from the data it's managing — the project's actual
files live in the working directory exactly as they would without any
version control at all; every fact Git knows *about* those files lives
in a different, clearly separated location. Also recognized in: a
database's own transaction log, kept apart from the actual table data it
describes; a filesystem's journal, tracking pending writes separately
from the files those writes will eventually update; a text editor's undo
stack, tracking every prior state of a document apart from the document
itself; and backup systems like Time Machine, which store a file's full
history in one place while the file you actually open every day stays
exactly where it's always been.

### SE Lens

The alternative already lived through in the previous Concept Unit: keep
every past version as its own separate, manually named file, mixed in
with the current one, in the same ordinary folder. That alternative has
a real, concrete cost this Concept Unit's Problem step named directly —
no shared agreement on which copy is current, no protection against one
person's copy silently overwriting another's, and no memory of *why* any
version differs from the last. Separating history into its own hidden
location doesn't remove the need to track history — that need is still
essential — but it removes the accidental complexity of a person
manually managing that tracking with filenames alone. The real cost this
step doesn't remove yet: `.git` currently contains no actual history at
all. Creating it is necessary, but on its own it accomplishes nothing —
it's an empty container, exactly as the confirmation message admitted,
waiting for the next two lessons to give it something to hold.

### Commands Needed

- **`git`** — install status: not present by default on any of Windows,
  macOS, or most Linux distributions; must be installed once per
  machine. Running `git --version` after installing should print
  something like `git version 2.45.1`, confirming the install succeeded;
  the specific version number varies by installation and platform and
  does not affect anything this domain teaches.
- **`git init`** — no separate installation; available the moment `git`
  itself is installed. Run from inside the directory you want to become a
  repository, with no arguments.

### Run It

From inside the real `inventory-report/` project directory, containing
only `inventory_report.py` so far:

```bash
git init
```

prints:

```text
Initialized empty Git repository in /path/to/inventory-report/.git/
```

exactly as the isolated lab above predicted, on the real project this
time. `/path/to/` stands in for wherever `inventory-report/` actually
sits on your own machine; the rest of the line — `Initialized empty Git
repository in`, and the trailing `.git/` — will match exactly.

### Connecting Back

`git init` gives `inventory-report/` a place to store history — but, as
the SE Lens step above stated plainly, an empty one. `inventory_report.py`
sitting in the working directory right now is completely unaffected by
this command and completely unknown to that new, empty history. The next
Concept Unit checks exactly that gap directly, using the one Git command
built specifically to report it.

---

## Concept Unit: Asking Git What It Currently Knows

### The Problem

`inventory-report/` is now a repository, and `inventory_report.py` still
sits inside it, unchanged. Is that file part of the project's history
yet, or not? Nothing about looking at the file itself answers this — its
contents look identical either way. Answering it requires asking Git
directly, rather than guessing from the working directory alone.

### Project Change

- **Reference Source.** No reference counterpart — a from-scratch
  addition, continuing this domain's own running example.
- **Files affected.** None — this Concept Unit only reads the repository
  created in the previous one; it creates or modifies no files.
- **Change type.** N/A — no file change; this is a read-only inspection
  command.
- **Location.** Run from inside the same `inventory-report/` directory
  the previous Concept Unit turned into a repository.
- **Dependencies.** The `inventory-report/` repository created in the
  previous Concept Unit, containing `inventory_report.py`.

### The New Code

```bash
git status
```

### The Updated Project

Same as `git init` before it, this command has no surrounding code
structure to be placed inside — it's a standalone inspection, not a
fragment. What it returns is information about the whole repository's
current state, covered directly below once the isolated lab has shown
what its output actually distinguishes.

### Isolating the Concept: What `git status` Distinguishes

Run `git status` twice against the smallest possible sequence — once
immediately after `git init`, before any file exists in the repository at
all, and once after adding a single file — to see exactly what changes
between the two, on a throwaway repository unrelated to the real project:

```bash
mkdir lab && cd lab
git init -q
git status
```

prints:

```text
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

Now add one file and ask again:

```bash
printf 'apple\nbanana\n' > fruits.txt
git status
```

prints:

```text
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	fruits.txt

nothing added to commit but untracked files present (use "git add" to track)
```

This is called an **untracked file** — a file Git can see sitting in the
working directory (it names `fruits.txt` specifically) but has never been
told to include in the project's history. Creating the file with
`printf` didn't automatically enroll it in anything; Git had to be run
again, afterward, to even notice it exists. This `lab/` directory,
`fruits.txt`, and this output are now discarded and won't appear again;
the real `inventory-report/`'s own status, checked next, follows the
identical logic on the real project.

### Mechanical Walkthrough

Every distinct element of `git status`'s real output against
`inventory-report/`, in order (shown in full in the Run It step below;
walked through here against the structure both runs above already
share):

- **`git`** — the same single external program as every other command
  in this lesson.
- **`status`** — the subcommand selecting Git's reporting behavior
  specifically: unlike `init`, which changes something on disk, `status`
  only reads the repository's current state and prints a report; running
  it any number of times in a row, with nothing else happening in
  between, prints the identical output every time.
- **`On branch main`** — states which branch the repository is currently
  on. `main` is the name Git gave this repository's very first branch
  automatically, the moment `git init` ran — flagged here, not explained
  yet: what a branch actually is, and why one always exists even before
  anyone deliberately creates a second one, is Lesson 108's own subject.
- **`No commits yet`** — states plainly that, whatever else this report
  says about files, the repository's actual recorded history is still
  completely empty; nothing has been committed since `git init` created
  it.
- **`Untracked files:`** — a section header, present only when at least
  one file exists in the working directory that Git has never been told
  to track. Its absence (as in the very first `git status` run, against
  an empty directory) means no such files exist yet.
- **`(use "git add <file>..." to include in what will be committed)`** —
  a hint line Git prints alongside the untracked-files section, naming
  the specific command, `git add`, that changes a file's status from
  untracked to tracked. Flagged here, not explained yet: what `git add`
  actually does to a file, and the specific new state — the *staging
  area* — it moves that file into, is Lesson 106's own subject,
  Versioned State.
- **`	inventory_report.py`** — the file itself, listed under the
  Untracked files header, indented, exactly as `fruits.txt` was in the
  isolated lab above.
- **`nothing added to commit but untracked files present (use "git add"
  to track)`** — a closing summary line, restating in one sentence what
  the report above it already showed in more detail: nothing is
  currently ready to be recorded, because nothing has been told to be.

### CS Lens

`git status` reports state without changing it — a property with a real
name, **idempotence**: running the same read-only operation any number
of times produces the identical result each time, with no side effects
accumulating. Also recognized in: a thermostat's temperature reading (checking
the temperature doesn't change the temperature), an HTTP `GET` request
under the web's own conventions (fetching a page is expected not to
modify anything on the server), a database `SELECT` query as opposed to
an `UPDATE`, and a debugger's "inspect variable" action as opposed to
"step" or "set value."

### SE Lens

The alternative to asking a tool is trusting memory: believing you
remember which files you've already told Git about and which you
haven't, across a project that, in real work, can span months and
dozens of files. That alternative's cost isn't hypothetical — it's the
exact failure mode the previous Concept Unit's `.git` directory exists to
prevent, reintroduced by a different door: if you can't reliably recall
which files are tracked, you're back to the same uncertainty
copy-based versioning caused, just with a `.git` folder sitting nearby,
unused, doing nothing to help. `git status`'s real value is that it
never has to be trusted from memory; it can be asked, at any moment, for
free, as often as needed, and it always answers from the repository's
actual current state rather than anyone's recollection of it.

### Commands Needed

- **`git status`** — no separate installation; available the moment
  `git` itself is installed. Run with no arguments, from inside any
  directory that is a Git repository or sits inside one.

### Run It

From inside the real `inventory-report/` project, immediately after the
previous Concept Unit's `git init`:

```bash
git status
```

prints:

```text
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	inventory_report.py

nothing added to commit but untracked files present (use "git add" to track)
```

This confirms, on the real project, exactly what both the Problem step
and the isolated lab predicted: turning a directory into a repository
and having a file sit inside that directory are two independent facts.
`inventory_report.py` exists on disk, and Git can see it — it names the
file by its real, correct filename — but nothing about it has been
recorded into the repository's history yet.

### Connecting Back

The real `inventory-report/` project now has everything this lesson set
out to build: a working file, a real Git repository wrapping it, and
direct, tool-reported confirmation that the file is visible but not yet
part of any recorded history. That gap — a file Git can see but hasn't
recorded — is precisely where Lesson 106, Versioned State, picks up.

---

## Connect the Pieces

One thread runs through all three Concept Units, start to finish. The
Problem step opened with a real failure: two people, one function,
`low_stock_items`, changed independently, its differences knowable only
by staring at two open files side by side. `diff -u` fixed exactly that
one problem — feed it `inventory_report_v1.py` and
`inventory_report_v2_FINAL.py`, and it reported precisely what changed,
line by line, without a person doing the comparison by eye. But `diff`
only ever compares two files that already exist, by name, at the moment
someone thinks to run it — it has no memory between runs, no way to
combine two people's changes into one file, and nothing to offer a
project that was never manually copied in the first place. `git init`
took the real project, `inventory-report/`, containing nothing but a
single working file, and gave it a second thing: a `.git` directory,
sitting invisibly alongside it, purpose-built to hold exactly the kind
of history `diff`-and-manual-copies never actually recorded anywhere.
And `git status`, run immediately afterward, proved that container was
still empty — `inventory_report.py` sits in the working directory, real
and readable, and Git can see it's there, but nothing about it has been
told to Git yet. Three tools, one connected story: comparing what you
already have by hand, creating somewhere real to store what you'll need
later, and confirming, honestly, that storing it hasn't happened yet.

## What Breaks Without This

Cause the specific failure `git init` exists to prevent, on purpose.
From a brand-new, empty directory that has never had `git init` run
inside it:

```bash
mkdir not-a-repo-yet && cd not-a-repo-yet
git status
```

prints:

```text
fatal: not a git repository (or any of the parent directories): .git
```

and the command exits with status `128`, not `0` — a real, distinct
failure Git reports specifically, not silence and not a blank report.
This is the honest, concrete version of the uncertainty the whole
Problem step described in prose: without a `.git` directory somewhere in
this folder or any folder above it, Git has genuinely nothing to report
— no branch, no commit count, no tracked-versus-untracked distinction —
because none of those concepts exist yet without a repository to hold
them. Running `git init` right here, in this exact directory, and then
running `git status` again immediately afterward, restores exactly the
working, reportable state every Concept Unit above demonstrated —
proving the fix directly, not just asserting it.

## Exercises

1. Pick any real file currently sitting in a project folder on your own
   machine that has never had `git init` run inside it. Run `git status`
   there first, and confirm it fails with the same `fatal: not a git
   repository` message shown above. Then run `git init`, then `git
   status` again, and write one sentence describing exactly what changed
   between the two `git status` results and why.
2. Using `diff -u`, compare any two real files on your own machine that
   are similar but not identical — two drafts of a document, two
   versions of a config file, anything you already have. Find one hunk
   in the output and, without looking anything up, state in your own
   words what the two numbers inside its `@@ ... @@` header mean.
3. Create a brand-new empty directory, run `git init`, and, before
   creating any files inside it at all, run `git status`. Compare this
   output to the `git status` output shown in this lesson's own
   isolated lab (also run against an empty repository) and confirm they
   match. Then create one new file and run `git status` a third time;
   name specifically which section of the output changed and why.

## Definition of Done

- [ ] `inventory-report/` exists as a real directory containing
      `inventory_report.py`.
- [ ] `git init` has been run inside `inventory-report/`, confirmed by a
      `.git` directory now existing alongside `inventory_report.py`.
- [ ] `git status`, run inside `inventory-report/`, reports
      `inventory_report.py` under `Untracked files:` — confirming Git
      can see the file but hasn't recorded it yet.
- [ ] The `fatal: not a git repository` failure has been reproduced on
      purpose, in a separate directory with no `.git` inside it, and
      resolved by running `git init` there too.
- [ ] `diff -u` has been run against two real, differing files — either
      the ones this lesson used or two of your own — and every line of
      its output can be explained: which lines are headers, which are
      context, which are removed, which are added.

Commit what exists of `inventory-report/` so far — even though
`inventory_report.py` is still only untracked, not yet part of any
recorded history; that gap is exactly where the next lesson begins:

```bash
git commit -m "not yet possible: inventory_report.py is still untracked"
```

Running this right now prints:

```text
On branch main

Initial commit

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	inventory_report.py

nothing added to commit but untracked files present (use "git add" to track)
```

and exits with status `1` — a real, reported failure, not silence. This
is deliberate, not an error to fix: it's the honest, concrete state this
lesson leaves the project in. Git is telling you, directly, the same
thing `git status` already showed — there is nothing staged to commit —
and precisely why Lesson 106, Versioned State, exists to close it.
