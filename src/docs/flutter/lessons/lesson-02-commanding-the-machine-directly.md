# Lesson 2: Commanding the Machine Directly

**What you will build:** By the end of this lesson you will be able to
create, inspect, navigate, and delete real files and folders, inspect and
control real running processes, and install/inspect real software —
entirely by typing commands, with no file-explorer window or Task Manager
GUI open at all. The actual subject of this lesson is what a terminal
*is*: not a mysterious black box for typing cryptic incantations, but a
direct, precise way of telling the operating system to do exactly the
same things Lesson 1's GUI tools (File Explorer, Task Manager, the
Environment Variables dialog) do — with the advantage that every command
is exact, repeatable, and combinable with others, instead of a sequence
of clicks that leaves no record of what you did.

**What you need to know first:** Lesson 1 — specifically: what a process
is and that it has a process ID (Concept Unit 2), what an environment
variable is and the real difference between a process-scoped one and a
persistent one (Concept Unit 4), and that `PATH` is one specific
environment variable listing folders the shell searches for bare command
names (Concept Unit 4/5).

**Terms used in this lesson:**

- **Filesystem** — the operating system's own scheme for organizing every
  file and folder on a storage device into one connected structure, with
  a defined way to look any of them up by name. It exists because
  storage (Lesson 1) is just a huge flat space of bytes at the hardware
  level — nothing about the physical disk itself has any concept of
  "files" or "folders"; the operating system imposes that structure
  entirely in software so humans and programs have something organized
  to work with.
- **File** — a named, contiguous unit of stored data the filesystem
  tracks as one thing — `hello.dart` from Lesson 1 is one. It exists as
  the filesystem's basic unit of storage: the smallest thing you can
  independently create, read, move, or delete.
- **Directory (folder)** — a named container the filesystem tracks that
  holds other files and directories, rather than holding data itself. It
  exists so files can be grouped and organized instead of every single
  file on a drive sitting in one enormous, unsorted pile.
- **Root directory / drive** — the one directory every other file and
  directory on a given storage device is nested inside of, directly or
  indirectly — on this Windows machine, `C:\` for the machine's main
  drive. It exists as the fixed starting point every path (below) is
  ultimately anchored to.
- **Path** — a string that names one specific file or directory's
  location by describing the chain of directories (starting from
  somewhere) that leads to it, with each step separated by a backslash
  on Windows. It exists because a bare name like `ideas.txt` is
  ambiguous — many different directories could each contain a file with
  that exact name — while a path names exactly one location,
  unambiguously.
- **Absolute path** — a path that starts from the root directory (drive
  letter) itself, like `C:\Users\g4m3r\Documents\open-calc`, and so names
  the same exact location no matter what directory you were in when you
  wrote it. It exists for the cases where "the same location, always, no
  matter where you're starting from" is exactly what's needed.
- **Relative path** — a path written starting from wherever the shell
  currently *is* (the current working directory, below) rather than from
  the root — `.\sudoku_notes\ideas.txt` names a different real file
  depending on which directory you were in when you typed it. It exists
  because typing a location's full absolute path every time, when you're
  already standing right next to it, is needlessly verbose.
- **Current working directory** — the one specific directory a running
  process (here, the shell itself) considers "where it currently is,"
  used as the starting point for resolving every relative path that
  process is given. It exists because a process has to have *some*
  answer to "relative to what?" — without one, a relative path would be
  meaningless.
- **`.` (current-directory reference)** — a fixed, special path segment
  meaning "the current working directory itself." It exists so a
  relative path can explicitly start from "here" (`.\sudoku_notes`)
  rather than being ambiguous about whether a bare name like
  `sudoku_notes` is relative or something else.
- **`..` (parent-directory reference)** — a fixed, special path segment
  meaning "the directory that directly contains this one." It exists so
  a path can move *upward* in the filesystem's hierarchy without needing
  to know or type that parent directory's actual name.
- **PowerShell parameter** — a named input passed to a cmdlet (below),
  written as a dash followed by the parameter's name, then (for
  parameters that take one) a value — `-ItemType Directory` passes the
  value `Directory` to the `-ItemType` parameter. This is a different,
  related idea from Lesson 1's Concept Unit 5 command-line **flag**
  (`--version`, `-v`): a flag there was a bare on/off switch with no
  value attached; a PowerShell parameter routinely carries a specific
  value the cmdlet needs to do its job, not just an on/off toggle.
- **Package** — a pre-built, distributable bundle of software (a program,
  or a library other programs depend on) along with the metadata needed
  to install, update, and remove it as one coherent unit. It exists so
  installing real software doesn't mean manually hunting down files and
  copying them into the right folders by hand, the way Lesson 1's manual
  Flutter SDK extraction actually did.
- **Package manager** — a program whose job is finding, installing,
  updating, and removing packages, tracking what's already installed and
  what each package depends on. It exists to make the manual, error-prone
  parts of installing software — as Lesson 1's very own SDK install
  demonstrated by hand — into one reliable, repeatable command instead.
- **Environment variable** — already given a full Term entry in Lesson 1:
  a named piece of configuration data living outside any one program's
  own source code, attached to a running process. Reappearing here
  because this lesson shows the real, terminal-native way to inspect
  *all* of them at once, rather than one at a time.
- **PATH** — already given a full Term entry in Lesson 1: the specific
  environment variable listing folders the shell searches for bare
  command names. Reappearing here because this lesson looks at its real,
  raw internal structure — a single string with many folder paths packed
  into it — for the first time.
- **Process** — already given a full Term entry in Lesson 1: one running
  instance of a program, with its own process ID and its own slice of
  RAM. Reappearing here because this lesson, for the first time, doesn't
  just *observe* a process (Task Manager, Lesson 1) but actually starts
  and forcibly ends one from the terminal.
- **Process ID (PID)** — already given a full Term entry in Lesson 1: the
  unique whole number the OS assigns a process the moment it starts.
  Reappearing here because this lesson uses a PID, for the first time,
  as an actual argument to a real command (`Stop-Process -Id`), not just
  as something read and observed.

**Objects and methods used:**

- **`Get-Location`**
  - *What it is:* A cmdlet (PowerShell's term for one of its own built-in
    commands) that reports the shell's current working directory.
  - *Implementation:* Takes no required parameters; returns a `PathInfo`
    object whose `Path` property holds the current working directory as
    a string. Its output, printed directly, displays as a small table
    with one `Path` column.
  - *Its use:* This lesson's way of proving, concretely, that
    `Set-Location` (below) really did move the shell somewhere new,
    rather than just claiming it.
  - *Type:* a cmdlet — PowerShell's own name for a built-in command,
    implemented internally as a .NET class, but invoked and thought about
    as a single named command, not as an object you construct.
  - *Responsibility:* report the one, single, current working directory
    of the shell process that runs it — nothing else; it does not change
    anything, only reads and reports existing state.
  - *Depends on:* nothing beyond the shell process it runs inside of —
    every process (Lesson 1) already has exactly one current working
    directory as part of its own OS-tracked state; `Get-Location` only
    reads it.
  - *Connects to:* has no real "callees" of its own; it is called
    directly by whoever is at the terminal (or, later in this
    curriculum, by a script), and its output is either displayed
    directly or piped into another cmdlet for further use.
  - *Shape:* a read-only query at the very outer edge of this lesson's
    system — it inspects the shell's own state without touching the
    filesystem itself at all.

- **`Set-Location`**
  - *What it is:* A cmdlet that changes the shell's current working
    directory to a new one — PowerShell's real name for what is commonly
    called `cd`.
  - *Implementation:* Takes one main parameter, `-Path` (usable
    positionally, without typing `-Path` explicitly, as this lesson's
    real code does), naming the directory to move into. Produces no
    output of its own on success.
  - *Its use:* This lesson's way of actually moving between the practice
    directories it creates, rather than only ever working from one fixed
    location.
  - *Type:* a cmdlet.
  - *Responsibility:* update the shell process's own current-working-
    directory state to point at a different, real, existing directory —
    and fail with a real error if the given path doesn't exist or isn't
    a directory.
  - *Depends on:* a path (absolute or relative) to a directory that must
    already exist.
  - *Connects to:* called directly at the terminal; every relative path
    given to any later command in the same shell session (including
    `Get-Location`'s own report) is affected by what `Set-Location` just
    changed.
  - *Shape:* a mutation of the shell's own process state — distinct from
    the filesystem-mutating cmdlets below, since it changes nothing on
    disk, only the shell's own idea of "where it is."
  - *Alias:* PowerShell defines `cd` as a built-in alias — a second,
    shorter name — for this exact same cmdlet; typing `cd` and typing
    `Set-Location` invoke the identical underlying command. This lesson
    uses the real name throughout, per this curriculum's own convention
    of always showing what a shorthand actually is a shorthand *for*.

- **`Get-ChildItem`**
  - *What it is:* A cmdlet that lists the items directly inside a given
    location — PowerShell's real name for what is commonly called `ls`
    or `dir`.
  - *Implementation:* Takes an optional `-Path` parameter (defaulting to
    the current working directory if omitted); returns a collection of
    real filesystem-item objects (`FileInfo` for files, `DirectoryInfo`
    for directories), each carrying real properties like `Name`,
    `Length` (file size in bytes), and `LastWriteTime`.
  - *Its use:* This lesson's way of confirming, after every creation or
    deletion, exactly what really exists in a given directory right now
    — not assumed, checked.
  - *Type:* a cmdlet.
  - *Responsibility:* enumerate the direct contents of one location (a
    filesystem directory, in this lesson's use — PowerShell can point it
    at other kinds of locations too, covered below) and return one real
    object per item found, with that item's real, current metadata.
  - *Depends on:* a location to list — a real, existing directory (or,
    as this lesson's Concept Unit 6 shows, PowerShell's `Env:` drive).
  - *Connects to:* called directly at the terminal in this lesson;
    commonly piped into formatting cmdlets like `Format-Table` (used
    throughout this lesson's own real output) or filtering cmdlets to
    narrow down a large result.
  - *Shape:* a read-only query, like `Get-Location`, but reading the
    filesystem's own state rather than the shell process's state.

- **`New-Item`**
  - *What it is:* A cmdlet that creates a new file or directory.
  - *Implementation:* Takes `-ItemType` (`"Directory"` or `"File"`,
    exactly as this lesson's real code uses), `-Path` (or `-Name`, for a
    new item inside the current directory), and creates a real, empty
    item of that type at that location; returns an object representing
    the newly-created item.
  - *Its use:* This lesson's way of actually building the practice
    folder structure (`sudoku_notes`, `ideas.txt`) it then navigates,
    lists, and deletes.
  - *Type:* a cmdlet.
  - *Responsibility:* create exactly one new, empty filesystem item, of
    the specified type, at the specified location — and fail with a real
    error if something with that name already exists there.
  - *Depends on:* an item type and a location; for a *file*, the
    containing directory must already exist (this lesson's real code
    creates `sudoku_notes` before creating `ideas.txt` inside it, in that
    order, for exactly this reason).
  - *Connects to:* called directly at the terminal; whatever it creates
    immediately becomes visible to `Get-ChildItem`, `Test-Path`, and
    every other filesystem-reading cmdlet.
  - *Shape:* the first filesystem-*mutating* cmdlet in this lesson —
    unlike `Get-Location`/`Get-ChildItem`, it changes real, persistent
    state on disk, not just reports it.

- **`Remove-Item`**
  - *What it is:* A cmdlet that deletes a file or directory.
  - *Implementation:* Takes a `-Path` (usable positionally, as this
    lesson's real code does); deletes the real item at that location.
    Given a non-empty directory without an additional `-Recurse`
    parameter, it refuses and reports a real error rather than silently
    deleting everything inside — this lesson's own real code deletes
    `ideas.txt` first, then the now-empty `sudoku_notes` directory,
    specifically to avoid needing `-Recurse` at all.
  - *Its use:* This lesson's way of cleaning up the practice structure it
    built, proving deletion is real and permanent, not a guess.
  - *Type:* a cmdlet.
  - *Responsibility:* permanently remove exactly the one specified,
    already-existing filesystem item — and refuse, rather than silently
    doing something broader, when asked to remove a non-empty directory
    without being explicitly told it's allowed to.
  - *Depends on:* a path to a real, already-existing item.
  - *Connects to:* called directly at the terminal; its effect is
    immediately visible to `Test-Path` (below) and `Get-ChildItem` —
    exactly how this lesson's own real code proves it worked.
  - *Shape:* the second filesystem-mutating cmdlet in this lesson,
    the destructive counterpart to `New-Item`.

- **`Test-Path`**
  - *What it is:* A cmdlet that checks whether something exists at a
    given location, without touching it.
  - *Implementation:* Takes a `-Path` (usable positionally); returns a
    single `bool` value — `$true` if something real exists there right
    now, `$false` if nothing does.
  - *Its use:* This lesson's real, checkable proof that `Remove-Item`
    actually deleted what it was told to — rather than trusting that it
    silently worked.
  - *Type:* a cmdlet.
  - *Responsibility:* answer exactly one yes/no question — does
    something exist at this specific location, right now — nothing more;
    it does not report what kind of thing it is, or anything about it
    beyond existence.
  - *Depends on:* a path to check.
  - *Connects to:* called directly at the terminal in this lesson,
    immediately after each `Remove-Item` call, specifically to check its
    result.
  - *Shape:* a read-only query, the simplest of the three filesystem-
    reading cmdlets this lesson uses (`Get-Location`, `Get-ChildItem`,
    `Test-Path`) — it reports the least information (one true/false),
    about the most specific question (this one exact location).

- **`Resolve-Path`**
  - *What it is:* A cmdlet that converts a relative path into its real,
    full, absolute form.
  - *Implementation:* Takes a `-Path` (usable positionally); returns an
    object whose `Path` property holds the absolute path form of
    whatever relative (or already-absolute) path it was given, resolved
    against the shell's real current working directory.
  - *Its use:* This lesson's real, checkable proof that a relative path
    and its absolute equivalent genuinely name the exact same file — not
    an assertion, a real conversion the reader can verify.
  - *Type:* a cmdlet.
  - *Responsibility:* take one path, in whatever form it was written, and
    report the single, unambiguous, absolute path it actually refers to
    right now, given the shell's current working directory.
  - *Depends on:* a path to resolve, and — for a relative path
    specifically — the shell's own current working directory
    (`Get-Location`'s own subject) as the base it resolves relative to.
  - *Connects to:* called directly at the terminal in this lesson; its
    output is the direct evidence this lesson's Concept Unit 2 uses to
    prove the absolute/relative distinction.
  - *Shape:* a read-only query that sits conceptually between
    `Get-Location` (reports the base) and a plain path string (the thing
    being resolved against that base).

- **`Start-Process`**
  - *What it is:* A cmdlet that launches a new process from the shell.
  - *Implementation:* Takes the name (or path) of a program to launch as
    its first argument, and an optional `-PassThru` parameter (used in
    this lesson's real code) that makes it return an object representing
    the process it just started — without `-PassThru`, it starts the
    process but hands nothing back to capture.
  - *Its use:* This lesson's way of creating a real, disposable process
    (a Notepad window) specifically so it can be inspected and then
    forcibly ended by a later command in the same unit — without
    `-PassThru`, there would be no way to capture that new process's real
    PID to target with `Stop-Process`.
  - *Type:* a cmdlet.
  - *Responsibility:* ask the operating system to create a new process
    running the named program, and, only if `-PassThru` was given, hand
    back an object representing that new process — including its real,
    freshly-assigned process ID.
  - *Depends on:* the name or path of a real, runnable program.
  - *Connects to:* called directly at the terminal; the object it
    returns (when `-PassThru` is used) is what this lesson's real code
    hands to `Get-Process -Id` and `Stop-Process -Id` afterward, by way
    of its `Id` property.
  - *Shape:* the process-creating counterpart to `New-Item` — a
    mutating operation, but one that creates a new *process* (Lesson 1)
    rather than a new *file*.

- **`Get-Process`**
  - *What it is:* A cmdlet that reports on already-running processes —
    the same real, underlying data Task Manager's Details tab (Lesson 1)
    displays, available here from the terminal instead.
  - *Implementation:* Takes an optional `-Id` parameter (used in this
    lesson's real code) to look up one specific process by its process
    ID; without it, reports every process currently running. Returns
    real `Process` objects carrying properties including `Id`,
    `ProcessName`, and `WorkingSet64` (RAM usage in bytes) — the exact
    same properties this curriculum's own Lesson 1 verification already
    used.
  - *Its use:* This lesson's real, checkable proof that the process
    `Start-Process` just launched is genuinely running, with a real PID
    and real RAM usage, before it gets ended.
  - *Type:* a cmdlet.
  - *Responsibility:* report real, current, live data about one or more
    already-running processes — it does not start, stop, or otherwise
    affect any process; strictly a read-only query.
  - *Depends on:* nothing to report on everything; a specific `-Id` to
    narrow it to one process, as this lesson's real code does.
  - *Connects to:* called directly at the terminal, immediately after
    `Start-Process`, targeting the exact PID that call returned.
  - *Shape:* a read-only query — the terminal-native equivalent of
    Lesson 1's Task Manager Details tab, now scriptable and precise
    instead of requiring a person to click through a GUI.

- **`Stop-Process`**
  - *What it is:* A cmdlet that forcibly ends an already-running process.
  - *Implementation:* Takes an `-Id` parameter (used in this lesson's
    real code) naming the exact process to end, by its process ID.
    Produces no output on success; asking it to end a process ID that no
    longer exists produces a real error.
  - *Its use:* This lesson's way of proving, with a real, deliberate
    demonstration, that a process really can be controlled — not just
    observed — directly from the terminal.
  - *Type:* a cmdlet.
  - *Responsibility:* ask the operating system to immediately terminate
    exactly the one specified, already-running process — an abrupt stop,
    not a request the target process can decline or clean up gracefully
    before honoring.
  - *Depends on:* a process ID naming a process that is, at the moment
    this cmdlet runs, actually still running.
  - *Connects to:* called directly at the terminal in this lesson,
    targeting the exact PID `Start-Process` returned moments earlier; its
    effect is immediately provable by calling `Get-Process -Id` again
    with that same ID and getting a real error instead of a result.
  - *Shape:* the destructive, process-affecting counterpart to
    `Get-Process` — the same relationship `Remove-Item` has to
    `Get-ChildItem` on the filesystem side, mirrored here on the process
    side.

- **`winget`**
  - *What it is:* A command-line program — the Windows Package Manager,
    Microsoft's own official package manager, built into modern Windows.
  - *Implementation:* A real, standalone executable already present on
    this machine (confirmed with a real, captured `winget --version`
    run, reporting `v1.29.290`). Its `list` subcommand — used in this
    lesson as `winget list --id <package-id>` — reports whether a
    specific package is installed and, if so, its real, current version.
  - *Its use:* This lesson's one concrete, real example of a package
    manager doing exactly what this lesson's Terms glossary describes one
    as being for — checking on installed software by name, without
    manually hunting through folders.
  - *Type:* a standalone executable program, the same structural kind as
    Lesson 1's `dart`/`flutter` entries.
  - *Responsibility:* everything the Windows Package Manager exposes —
    searching for, installing, updating, uninstalling, and listing
    packages — of which this lesson uses exactly one corner: `list`,
    purely to inspect, never to install or remove anything.
  - *Depends on:* nothing this lesson passes it beyond a package's `id`
    to look up; internally it depends on Windows' own package sources
    being reachable.
  - *Connects to:* invoked directly by whoever is at the terminal; this
    lesson's real run checks for Visual Studio Code specifically — a
    program this lesson does not install (it was already present) —
    purely to prove `winget` can report real, accurate, installed-package
    data.
  - *Shape:* a system-wide utility, outside any single project's own
    files entirely — the same category of tool `flutter doctor` (Lesson
    1) belongs to: something that inspects the machine itself, not any
    one program running on it.

---

## Concept Unit: The Filesystem — Files and Directories

### The Problem

Lesson 1 already used the words "file" and "folder" informally —
`hello.dart` was a file; installing Flutter created a folder at
`C:\flutter`. Neither lesson has yet said what a filesystem actually
*is*, structurally. Given that Lesson 1's Concept Unit 1 already
established that storage is just a slow-but-permanent place to keep
bytes, with no mention of anything called a "file" at the hardware level
— where does the idea of files and folders actually come from?

> **Stop and think before reading on:** If storage hardware itself is
> just a huge space for bytes, with no built-in concept of "files," what
> do you think has to be layered on top of it — in software, not
> hardware — for `Get-Location`'s real output in Lesson 1's own
> verification (`C:\flutter\bin\cache\dart-sdk\bin\dart.exe`) to mean
> anything at all? Who is responsible for deciding that this run of
> bytes on the disk is "one file," and that group of bytes over there is
> "a different one"?

### Project Change

- **Reference Source:** No reference counterpart — conceptual.
- **Files affected:** None — this unit inspects the existing project
  structure (this repository's own real folders) rather than creating
  anything.
- **Change type:** N/A — observation.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code

No code to type — this is direct inspection of a real, already-existing
directory structure: this curriculum's own folder, whose real, top-level
contents (as of this lesson) are:

```
src/docs/flutter/
├── curriculum.md              (a file)
├── HANDOFF.md                 (a file)
├── lessons/                   (a directory)
│   ├── lesson-01-....md       (a file)
│   └── lesson-02-....md       (a file, this lesson itself)
└── verification/              (a directory)
    ├── lesson-01/              (a directory)
    └── lesson-02/              (a directory)
```

### The Updated Project

Not applicable — no code introduced.

### Introduce the concept in isolation

This real structure, already sitting on disk, is direct, visible proof of
two genuinely different kinds of things coexisting in the same
filesystem location: `curriculum.md` and `HANDOFF.md` are **files** —
each one a single, named unit of stored data. `lessons/` and
`verification/` are **directories** — each one a named container holding
*other* files and directories, rather than holding data of their own.
Nothing about a directory's own name or appearance tells you it's "empty
of content" — `lessons/` clearly has real content — but that content is
always other files and directories, never raw data the directory itself
holds directly the way a file does.

### Discarding this observation

This exact snapshot of this curriculum's own folder will keep changing as
more lessons are added — it is not a fixed fact to memorize. What
carries forward is the distinction it illustrates: a **filesystem** is
built from exactly two kinds of things, files and directories, nested
inside one another, all the way up to one root.

### Mechanical walkthrough

- **`curriculum.md`, `HANDOFF.md`** — each a real file: one self-
  contained unit of stored text data, with its own name, its own real
  size in bytes (Lesson 1, Concept Unit 1), and its own last-modified
  time.
- **`lessons/`, `verification/`** — each a real directory: containers,
  not data. `lessons/` holds two files directly; `verification/` holds
  two directories directly (`lesson-01/`, `lesson-02/`), which
  themselves hold files further inside — proving directories can nest
  inside other directories, not just hold files directly.
- **The indentation/tree shape itself** — not filesystem syntax at all,
  just a way of drawing a hierarchy on a page; the real filesystem has no
  concept of "indentation" — it only has the actual containment
  relationship (this directory contains that file) that the drawing is
  representing.

### CS lens

A structure where each item has exactly one parent container, and
containers can nest inside other containers arbitrarily deep, with one
single container at the very top that everything else is (directly or
indirectly) inside of, is a **tree** — one of the single most common data
structures in all of computing, and this curriculum's first real-world
encounter with one, well before Lesson 9 (Collections) or any later
lesson formally teaches tree data structures in code.

```
Also recognized in: a company's organizational chart, a family
tree, HTML's own DOM structure (every element nested inside
exactly one parent), a book's chapter/section/subsection outline,
a directory of directories in a Unix filesystem, this very
lesson's own Header/Concept-Unit/step markdown structure
```

### SE lens

The alternative — one giant flat namespace with no directories at all,
every single file distinguished only by an increasingly long, unique
name — was, in effect, how some very early storage systems worked, and
the real cost was exactly what you'd expect: at any real scale, finding
anything, or expressing "these five hundred files all belong together,"
became unmanageable. A hierarchical filesystem trades away the
simplicity of "just one list of everything" for real organizational
structure — the cost being that *where* something lives now genuinely
matters and has to be gotten right, which is exactly why the next several
Concept Units in this lesson exist at all.

### Commands needed

None yet — this unit is pure observation of an already-existing, real
structure.

### Run it

The real directory structure shown above reflects this curriculum's
actual, current folder contents at the time this lesson was written —
not an invented example. Per the Verification Rule, this is the kind of
claim (what does a real, specific, existing directory actually contain
right now) that has to be checked against the real filesystem rather than
assumed, and was.

### Connecting this unit

This unit established what a file and a directory actually are, and that
a filesystem is a tree of them. Every remaining unit in this lesson is
about *doing* something with that tree from the terminal: naming a
location precisely (next unit), moving around it, listing it, changing
it, and — later in this lesson — inspecting two more filesystem-shaped
things (environment variables, running processes) using the exact same
tools.

---

## Concept Unit: Paths — Absolute and Relative

### The Problem

The tree structure shown in the previous unit makes clear that
`ideas.txt` (about to be created in Concept Unit 5) could, in principle,
exist inside many different directories at once, on this machine, all
with that exact same name. Simply saying "the file `ideas.txt`" would be
genuinely ambiguous. How does the filesystem — or a command that needs to
refer to one specific file — name *exactly one* location, unambiguously?

> **Stop and think before reading on:** Given the previous unit's tree
> structure — one root, with directories nesting inside directories all
> the way down — what do you think a complete, unambiguous "address" for
> one specific file would have to include? Would naming just the file
> itself ever be enough on its own?

### Project Change

- **Reference Source:** No reference counterpart — this unit reuses a
  real file created in Concept Unit 5 (`sudoku_notes\ideas.txt`),
  previewed here out of strict creation order because both units are
  short enough that showing the real, already-captured evidence together
  is clearer than fabricating a placeholder file just for this unit.
- **Files affected:** None new — inspects a path to a file created in
  Concept Unit 5.
- **Change type:** N/A — observation.
- **Location:** N/A.
- **Dependencies:** None for the observation itself.

### The New Code

Two commands run one after another, from inside
`verification/lesson-02/practice`:

```powershell
Get-Location
Resolve-Path ".\sudoku_notes\ideas.txt"
```

### The Updated Project

Not applicable — freestanding commands, nothing to place them inside of.

### Introduce the concept in isolation

Real, captured output from running exactly those two commands:

```
Path
----
C:\Users\g4m3r\Documents\open-calc\src\docs\flutter\verification\lesson-02\practice

Path
----
C:\Users\g4m3r\Documents\open-calc\src\docs\flutter\verification\lesson-02\practice\sudoku_notes\ideas.txt
```

The second command was given `.\sudoku_notes\ideas.txt` — a **relative
path**: it says nothing about drives or root directories, only "starting
from wherever I currently am, go into `sudoku_notes`, then find
`ideas.txt`." `Resolve-Path`'s real output proves what that relative path
actually resolves to: the complete, unambiguous **absolute path**,
anchored all the way back at the root (`C:\`). Change the current working
directory (next unit covers exactly how), and that same relative path,
typed identically, would resolve to a completely different real file —
while the absolute path form would keep pointing at this one exact file
no matter where the shell currently is.

### Discarding this example

This specific file, `ideas.txt`, and this specific real path are not
permanent fixtures of this curriculum — `ideas.txt` is deleted later in
this same lesson (Concept Unit 5). What carries forward is the proven
distinction: a relative path's meaning depends on the current working
directory it's resolved against; an absolute path's meaning does not.

### Mechanical walkthrough

- **`Get-Location`** — already given full CRC treatment in this lesson's
  header; here it establishes exactly what "relative to" means at the
  moment `Resolve-Path` is called immediately afterward.
- **`Resolve-Path`** — already given full CRC treatment above; its one
  argument, `.\sudoku_notes\ideas.txt`, is the relative path being
  converted; its real output is that path's one, true, absolute form.
- **`.`** — already given a real Terms entry above: explicitly marks
  "starting from the current working directory." Dropping it (writing
  just `sudoku_notes\ideas.txt`) would, in PowerShell, still resolve the
  same way in this specific case — but explicitly starting a relative
  path with `.\` is this curriculum's convention throughout, because it
  makes "this is a relative path, on purpose" visually unambiguous at a
  glance, rather than looking like it might be a bare command name.
- **`\`** — the separator between each step of a path on Windows,
  already implicit in every path shown so far; called out explicitly
  here because this is the first unit centrally *about* path structure:
  each `\` marks the boundary between one directory's name and the next
  step inside it.

### CS lens

Resolving a relative reference against a current "frame" to get an
unambiguous absolute one is a specific, recurring idea: **relative
addressing**. The same underlying idea — a short reference that only
means something in combination with a separately-tracked "where am I
right now" — recurs constantly once this curriculum reaches real
programming: a relative import path in Dart, relative URLs in a web
request, even array indexing offsets in low-level code.

```
Also recognized in: giving directions as "turn left, then it's the
third door" instead of full GPS coordinates, a relative cell
reference in a spreadsheet formula, a relative URL like
"../images/logo.png" on a web page, a musical interval (a third
above whatever note you're already on) instead of naming an
absolute pitch
```

### SE lens

Supporting *both* absolute and relative paths, rather than just one, is a
deliberate design tradeoff most real filesystems and shells make:
absolute paths are unambiguous and portable across contexts but verbose
and brittle if a directory ever moves; relative paths are short and
naturally adapt to where you're already working but silently mean
something different depending on invisible context (the current working
directory) that isn't written in the path itself. This exact tradeoff
resurfaces directly and concretely once this curriculum starts writing
real Dart import statements.

### Commands needed

- **`Resolve-Path <path>`** — already given full treatment above; no
  install or setup required.

### Run it

The real output shown above is genuine, captured output from actually
running both commands on this machine — per the Verification Rule, the
exact real absolute path a specific relative path resolves to on this
specific machine is not something to state from confidence; it depends
on real, current filesystem state and was checked for real, saved in
`src/docs/flutter/verification/lesson-02/run-log.md`.

### Connecting this unit

The previous unit established that files and directories form a tree;
this unit established the two ways to unambiguously name one location
within that tree. The next unit puts relative paths to real, repeated
use: actually moving the shell's current working directory around that
tree.

---

## Concept Unit: Knowing and Changing Where You Are

### The Problem

The previous unit's whole demonstration depended on one thing never
explained yet: what does it actually mean for a shell to have a "current
working directory" at all, and how does that ever change? Lesson 1,
Concept Unit 2 already established that a process has its own private
state the OS tracks — is "current working directory" one more piece of
that same per-process state, or something else entirely?

> **Stop and think before reading on:** Lesson 1 already established that
> each process has its own separate, private state (its own memory, its
> own PID). If two completely different terminal windows were both open
> at once, each running its own separate PowerShell process, would you
> expect changing one window's "current location" to affect the other
> window at all? Why or why not, given what you already know about how
> separate processes relate to each other?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None — no file is created or changed; only the
  shell process's own state changes.
- **Change type:** Configure (the shell process's own current working
  directory).
- **Location:** Any PowerShell terminal.
- **Dependencies:** A real, already-existing directory to move into —
  this unit uses `sudoku_notes`, created for real in Concept Unit 5,
  previewed here for the same reason as the previous unit.

### The New Code

```powershell
Get-Location
Set-Location .\sudoku_notes
Get-Location
Set-Location ..
Get-Location
```

### The Updated Project

Not applicable — freestanding commands.

### Introduce the concept in isolation

Real, captured output from running exactly that sequence:

```
Path
----
...\verification\lesson-02\practice

Path
----
...\verification\lesson-02\practice\sudoku_notes

Path
----
...\verification\lesson-02\practice
```

(Paths abbreviated here with `...` for the shared, unchanging prefix
`C:\Users\g4m3r\Documents\open-calc\src\docs\flutter`; the real, full,
unabbreviated output is saved in the verification log.) Three real
`Get-Location` calls, three different real answers in between two
`Set-Location` calls — direct, checkable proof that `Set-Location`
really does mutate something, and that `Get-Location` is genuinely
reading live, current state each time, not a cached or remembered value.

### Discarding this example

This specific three-step round trip is not something this curriculum
will replay again exactly as shown — but the underlying fact it proved
carries forward: the **current working directory** is real, mutable, per-
process state, exactly as Lesson 1's Concept Unit 2 would predict for
anything tracked "per process" — which directly answers this unit's own
Socratic prompt: two separate terminal windows, being two separate
processes, would each have their *own* current working directory,
completely unaffected by the other changing.

### Mechanical walkthrough

- **`Get-Location`** (first and third calls) — already given full CRC
  treatment; each call reads and reports whatever the shell's current
  working directory genuinely is at that exact moment, which is why the
  first and third results differ even though the same command was typed.
- **`Set-Location .\sudoku_notes`** — already given full CRC treatment;
  its one argument is the relative path (Concept Unit 2) naming where to
  move to, resolved against whatever the current working directory was
  *before* this command ran.
- **`Set-Location ..`** — the same cmdlet, this time given `..` — already
  given a real Terms entry above: "the directory that directly contains
  this one." Running it moves the shell back out to exactly the
  directory the previous `Set-Location` call had moved it out of,
  proving `..` genuinely means "my parent," not some fixed, hard-coded
  location.

### CS lens

A piece of state that persists and can be read or changed repeatedly
throughout a running process's lifetime — surviving between separate
commands, rather than being recreated fresh each time — is the same
underlying idea, applied to an entire process instead of one function, as
what this curriculum will later formally call **mutable state**, first
properly introduced once Lesson 5 covers variables. The current working
directory is, in effect, one single mutable variable the shell itself
maintains and every relative-path-consuming command reads from.

```
Also recognized in: a video game's "current save point," a text
editor's cursor position, a web browser's current tab and URL, a
GPS device's "current location" used to compute every new relative
direction it gives from that point forward
```

### SE lens

The alternative — every single command requiring a full, explicit,
absolute path with no notion of "current location" at all — would remove
any ambiguity about where a relative path points, at the direct cost of
enormous, repetitive verbosity for the extremely common case of doing
several things in a row inside the same directory. Maintaining a current
working directory as real, mutable, per-process state is the tradeoff
real shells make instead: a small amount of hidden, easy-to-forget
context (which unit's own Socratic prompt raised, correctly, as a live
question) in exchange for far less typing during ordinary, sequential
work.

### Commands needed

- **`Get-Location`** and **`Set-Location <path>`** — both already given
  full treatment above.

### Run it

The real, three-step output shown above was actually run on this
machine, not predicted — per the Verification Rule, the shell's own
real current-working-directory state at each step is exactly the kind of
thing that has to be checked, not assumed, and is saved in full,
unabbreviated form in
`src/docs/flutter/verification/lesson-02/run-log.md`.

### Connecting this unit

The previous unit explained what a path means; this unit put that
meaning to work, proving the current working directory is real, mutable,
per-process state that `Set-Location` changes and `Get-Location` reports.
The next unit adds the missing piece: actually seeing what's *inside*
wherever the shell currently is.

---

## Concept Unit: Listing What's There

### The Problem

Every unit so far has assumed the reader already knows what's inside a
given directory — this lesson's own tree diagram (Concept Unit 1) was
handed over ready-made. In practice, nobody keeps a mental map of every
real directory's contents at all times. Given a real, unfamiliar
directory, how do you find out, for certain, exactly what's inside it
right now?

> **Stop and think before reading on:** Concept Unit 1 already
> distinguished files from directories. Given a command that lists
> "what's inside a directory," what information do you think it would
> need to report about *each* item to let you tell, at a glance, which
> of the items listed are files and which are further directories,
> without opening each one?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None — read-only.
- **Change type:** N/A — observation.
- **Location:** Any directory.
- **Dependencies:** A real directory to list — this unit previews
  `sudoku_notes`, created for real in Concept Unit 5.

### The New Code

```powershell
Get-ChildItem
```

### The Updated Project

Not applicable — a single freestanding command.

### Introduce the concept in isolation

Real, captured output, run from `verification/lesson-02/practice` right
after `sudoku_notes` was created (Concept Unit 5):

```
Mode  LastWriteTime        Length Name
----  -------------        ------ ----
d---- 8/22/2026 7:06:05 PM        sudoku_notes
```

And real output from the same command, run one level deeper, inside
`sudoku_notes`, after `ideas.txt` was created inside it:

```
Mode  LastWriteTime        Length Name
----  -------------        ------ ----
-a--- 8/22/2026 7:06:05 PM      0 ideas.txt
```

### Discarding this example

This exact directory listing will look different the moment either file
is deleted (Concept Unit 5) — it is a live, disposable snapshot, not a
fixed fact. What carries forward is what the columns themselves mean,
proven by direct contrast between these two real, different rows.

### Mechanical walkthrough

- **`Mode` column** — a short code describing the item's type and
  attributes; `d----` (first row) marks a **d**irectory; `-a---` (second
  row) marks an ordinary file with the **a**rchive attribute set (a
  legacy Windows flag, still set by default on newly-created or newly-
  modified files, originally meant to track "has this been backed up
  yet"). This single column is the direct, real answer to this unit's
  own Socratic prompt: it's exactly how a real listing lets you tell
  files and directories apart without opening either.
- **`LastWriteTime` column** — the real timestamp the filesystem recorded
  the last time this item's contents were changed; both rows show the
  same moment here because both were created in the same instant, one
  right after the other.
- **`Length` column** — the item's real size in bytes, the same concept
  Lesson 1's Concept Unit 1 first measured for `hello.dart` (42 bytes).
  The directory row shows this blank — a directory's own entry doesn't
  store a content size the way a file does; its "size," if you wanted
  one, would mean the total size of everything nested inside it, which
  `Get-ChildItem` does not compute by default. The file row shows `0`
  because `ideas.txt` was created empty and never written to.
- **`Name` column** — each item's own name within its containing
  directory — not a path (Concept Unit 2); just the one final segment.

### CS lens

Reporting a uniform, tabular summary — the same fixed set of columns, one
row per item, regardless of how different two items actually are (a
27,000-line source file and an empty new folder both get exactly one
row, in the same shape) — is a specific, common design idea:
**enumeration with a uniform interface**. The same underlying idea
recurs the moment this curriculum reaches real Dart collections (Lesson
9): iterating over a `List` gives you one item at a time, in a uniform
way, regardless of how different those items' own contents might be.

```
Also recognized in: a spreadsheet's rows (every row has the same
columns, however different the row's actual data), a restaurant
menu (every dish listed the same way: name, description, price),
a phone's contacts list, a database query's result rows
```

### SE lens

The real tradeoff in a compact, tabular default view (as opposed to
printing every possible piece of metadata about every item, which
`Get-ChildItem`'s underlying objects genuinely do carry — visible in
this lesson's earlier, accidentally-verbose first attempt, saved in the
verification log, where every property printed at once) is legibility
versus completeness: a table with four well-chosen columns is instantly
scannable; the same data with every available property shown is
technically more complete but, in practice, far harder to actually read.
`Get-ChildItem`'s default formatting picks legibility; this lesson's own
real code explicitly asked for exactly the four columns that matter here
via `Format-Table`, rather than accepting whatever the default happened
to be.

### Commands needed

- **`Get-ChildItem`** — already given full treatment above; typing it
  alone lists the current working directory's contents.
- **`Format-Table <columns> -AutoSize`** — a formatting cmdlet that takes
  a list of property names and renders piped-in objects as an aligned
  table using only those columns, sizing each column automatically to
  fit its widest real value; used in this lesson's own real, captured
  output specifically to avoid the sprawling, all-properties dump a bare
  `Get-ChildItem` produced when first tried (visible, unedited, in the
  verification log as a real record of that first, messier attempt).

### Run it

Both real outputs shown above come from actually running `Get-ChildItem`
against real directories on this machine at two different points in this
lesson's own real terminal session — per the Verification Rule, real
directory listings, including real, specific timestamps, cannot be
predicted in advance and were captured for real, saved in
`src/docs/flutter/verification/lesson-02/run-log.md`.

### Connecting this unit

The previous two units established how to name a location and how to
move the shell there; this unit finally showed what's actually inside
one, once you arrive. The next unit stops only *observing* the
filesystem and starts changing it for real — creating and deleting real
files and directories.

---

## Concept Unit: Creating and Deleting

### The Problem

Every file and directory shown in this lesson so far — `sudoku_notes`,
`ideas.txt` — has been presented as if it already existed. None of them
did, before this lesson's own real terminal session created them. Lesson
1 already created one file (`hello.dart`), but only by opening a text
editor and saving it — never from the terminal itself. Can the terminal
create (and destroy) real files and directories directly, with no editor
or File Explorer involved at all?

> **Stop and think before reading on:** Given everything established so
> far about directories being containers and files holding data, what
> two separate pieces of information do you think a command would need,
> at minimum, to create a brand-new, empty file at a specific location —
> and would creating a *directory* need the exact same two pieces, or
> something different?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Created: `sudoku_notes\` (a directory), then
  `sudoku_notes\ideas.txt` (a file) inside it — both later deleted in
  this same unit. All inside
  `src/docs/flutter/verification/lesson-02/practice`.
- **Change type:** Add, then remove.
- **Location:** `verification/lesson-02/practice`, this lesson's own
  scratch area for real terminal practice.
- **Dependencies:** None.

### The New Code

```powershell
New-Item -ItemType Directory -Name "sudoku_notes"
New-Item -ItemType File -Path ".\sudoku_notes\ideas.txt"
```

### The Updated Project

Not applicable — both are brand-new items with nothing surrounding them
yet.

### Introduce the concept in isolation

Real, captured output from running exactly those two commands:

```
Name     : sudoku_notes
FullName : ...\verification\lesson-02\practice\sudoku_notes

Name     : ideas.txt
FullName : ...\verification\lesson-02\practice\sudoku_notes\ideas.txt
```

(Full, unabbreviated paths saved in the verification log.) Both commands
returned a real object describing exactly what was created — direct
proof, not a guess, that both now really exist. Later in this same unit,
real, captured proof of the reverse:

```powershell
Remove-Item ".\sudoku_notes\ideas.txt"
Test-Path ".\sudoku_notes\ideas.txt"
```
```
False
```

```powershell
Remove-Item ".\sudoku_notes"
Test-Path ".\sudoku_notes"
```
```
False
```

`Test-Path` reporting `False` immediately after each `Remove-Item` call
is real, checkable proof that deletion genuinely happened, rather than
trusting silence-means-success.

### Discarding this example

`sudoku_notes` and `ideas.txt` are, by design, gone by the end of this
very unit — they never persist past it. What carries forward is proven,
not this specific disposable folder: the terminal can create and
permanently destroy real filesystem items directly, with real, checkable
proof either way.

### Mechanical walkthrough

- **`New-Item`** (both calls) — already given full CRC treatment above.
- **`-ItemType Directory`** / **`-ItemType File`** — already given a
  real Terms entry above (PowerShell parameter): the first call's value
  (`Directory`) and the second's (`File`) are what make one call create a
  container and the other create a single unit of data — direct,
  real proof this unit's own Socratic prompt was onto something: creating
  a file and creating a directory genuinely do need to tell `New-Item`
  which of the two is wanted.
- **`-Name "sudoku_notes"`** — a parameter giving the new item's name,
  created directly inside the current working directory (Concept Unit
  3) since no further path is given.
- **`-Path ".\sudoku_notes\ideas.txt"`** — a parameter giving a full
  relative path (Concept Unit 2) for the second call, rather than just a
  bare name, because this file needs to land *inside* the
  directory the first call just created, not beside it.
- **`Remove-Item`** (both calls) — already given full CRC treatment
  above; the first targets the file specifically, the second the now-
  empty directory — in that order, deliberately, since a non-empty
  directory would refuse deletion without an extra parameter this lesson
  never needs to reach for.
- **`Test-Path`** (both calls) — already given full CRC treatment above;
  each call's real `False` result is this unit's actual, checkable
  evidence, not a claim taken on faith.

### CS lens

Creating and destroying named resources through explicit, individual
commands — rather than, say, resources simply existing forever once made,
with no way to reclaim them — is the most basic possible instance of
**resource lifecycle management**: something is allocated, exists for
some time doing useful work, and is eventually, deliberately released.
The exact same shape — explicit creation, a period of real use, explicit,
deliberate release — recurs constantly later in this curriculum: opening
and closing a database connection (Phase 6), acquiring and releasing a
lock, starting and stopping a process (this lesson's own next Concept
Unit).

```
Also recognized in: checking a library book out and back in,
renting and returning a car, opening and closing a bank account,
a factory receiving raw materials and shipping finished goods back
out
```

### SE lens

`Remove-Item`'s real refusal to delete a non-empty directory without an
explicit extra parameter (`-Recurse`), rather than simply deleting
everything inside it by default, is a deliberate safety-over-convenience
tradeoff: the "convenient" default (just delete it, whatever's inside)
would mean one small typo in a path could silently destroy an entire,
possibly large and irreplaceable, directory tree with no warning at all.
Requiring an explicit, extra, unmistakable signal of intent for that
specific, more dangerous case costs a small amount of typing in exchange
for making an entire category of catastrophic accidents require a
deliberate, second decision rather than one careless keystroke.

### Commands needed

- **`New-Item -ItemType <Directory|File> -Name <name>` or `-Path
  <path>`** — already given full treatment above.
- **`Remove-Item <path>`** — already given full treatment above.
- **`Test-Path <path>`** — already given full treatment above.

### Run it

All four real outputs shown above (two creations, two `False` deletion
proofs) come from actually running these exact commands on this machine
— per the Verification Rule, whether a specific deletion command really
succeeded is exactly the kind of claim that needs real, checked proof,
not an assumption that "no error means it worked." Full output saved in
`src/docs/flutter/verification/lesson-02/run-log.md`.

### Connecting this unit

Every prior unit in this lesson worked with the filesystem; this unit
proved the terminal can create and destroy real items in it directly,
with real proof either way. The next two units turn to two other things
this curriculum has already met — environment variables and processes —
and show they can be inspected the exact same terminal-native way,
properly, for the first time.

---

## Concept Unit: Environment Variables, From the Terminal

### The Problem

Lesson 1's Concept Unit 4 already introduced environment variables and
proved, with a real run, the difference between a session-scoped one and
a persistent one — but every single variable in that lesson was
inspected one name at a time (`$env:LESSON_DEMO`, `$env:JAVA_HOME`).
Concept Unit 5 (Lesson 1) revealed that a real, working `flutter doctor`
depends on several environment variables at once (`JAVA_HOME`,
`ANDROID_HOME`, `ANDROID_SDK_ROOT`, `PATH`, and more). Is there a way to
see *all* of a process's environment variables at once, rather than
guessing names one at a time?

> **Stop and think before reading on:** `Get-ChildItem` (this lesson's
> own earlier Concept Unit) already lists everything inside a
> *directory*. Given that an environment variable, like a file, has a
> name and a value, do you think the exact same listing idea could apply
> to environment variables too — and if PowerShell really does let you
> "list" them the same way, what do you think it would need to treat
> them *as*, structurally, for the same command to work on both?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None — read-only.
- **Change type:** N/A — observation.
- **Location:** Any PowerShell terminal.
- **Dependencies:** None.

### The New Code

```powershell
Get-ChildItem Env: | Sort-Object Name | Select-Object -First 5 Name
$env:Path -split ';'
```

### The Updated Project

Not applicable — freestanding commands.

### Introduce the concept in isolation

Real, captured output:

```
Name : ACSetupSvcPort
Name : ACSvcPort
Name : AI_AGENT
Name : ALLUSERSPROFILE
Name : APPDATA
```

and, from splitting `$env:Path` apart, its first five real entries (of
84 total, on this machine, in this specific terminal session):

```
C:\Program Files\PowerShell\7
C:\Python314\Scripts\
C:\Python314\
C:\mingw64\bin
C:\MinGW\bin
```

This is direct, concrete proof of two things this unit's own Socratic
prompt was asking about: `Get-ChildItem` really can list environment
variables using the *exact same cmdlet* used earlier in this lesson to
list files and directories — proof that PowerShell treats environment
variables as items inside something list-able, exactly like a directory
— and `PATH` (Lesson 1) is not one atomic value at all: it's a single
string with 84 separate folder paths packed into it, one after another,
separated by semicolons, only meaningful once split apart.

### Discarding this example

The exact count (138 environment variables, 84 `PATH` entries) and these
specific five names are facts about this one machine, in this one
terminal session, right now — not something to memorize. What carries
forward: `Get-ChildItem` works uniformly across more than one kind of
"location," and `PATH`'s real internal shape is a semicolon-separated
list, not a single value.

### Mechanical walkthrough

- **`Get-ChildItem Env:`** — the same cmdlet given full CRC treatment
  earlier in this lesson, called here against `Env:` instead of a real
  filesystem path. `Env:` is one of PowerShell's built-in **drives** —
  not a physical disk drive, but a PowerShell concept that presents some
  other structured data (here, the current process's environment
  variables) through the *same* item-listing interface as a real
  filesystem, letting a name/value pair be listed, filtered, and sorted
  exactly like a real file. This is why `Get-ChildItem` needed no new
  explanation to work here: it was never really "a filesystem-only
  cmdlet" to begin with — Concept Unit 4's earlier use of it against a
  real directory was already only one specific case of a more general
  capability.
- **`Sort-Object Name`** — a cmdlet that reorders whatever objects are
  piped into it by a named property; here, alphabetically by each
  variable's `Name` — used purely so the first five results shown are
  deterministic and reproducible, rather than whatever arbitrary order
  the OS happens to report them in.
- **`Select-Object -First 5 Name`** — a cmdlet that narrows down piped-in
  objects; `-First 5` keeps only the first five (after sorting), and
  naming `Name` keeps only that one property from each, rather than
  every property PowerShell's `EnvironmentVariableTarget` objects
  actually carry.
- **`$env:Path`** — PowerShell's own environment-variable syntax, already
  given a real Terms entry in Lesson 1; reading the `Path` variable
  specifically, out of the current process's environment, as one single
  string.
- **`-split ';'`** — a PowerShell operator that breaks a single string
  into an array of smaller strings, cutting at every occurrence of the
  given separator (here, a semicolon) and discarding the separator
  itself. Applied to `$env:Path`'s one long string, it produces 84
  separate strings, each one real folder path `PATH` actually lists.

### CS lens

Presenting genuinely different kinds of underlying data (real files on
disk, and a running process's own environment variables) through one
single, shared, consistent interface — so the same command works on both
without needing to know, in advance, which kind of thing it's really
talking to — is a specific, named idea: an **abstraction layer**, here
specifically PowerShell's own **provider** model. The same underlying
idea — hide genuinely different implementations behind one shared,
consistent interface — is one of the most load-bearing ideas in all of
software engineering, and this curriculum will build its own version of
exactly this idea starting at Lesson 43 (Repositories), where Sudoku's
own game logic will be written to not care whether its data actually
comes from a real database, a file, or plain memory.

```
Also recognized in: a car's steering wheel and pedals working the
same way whether the engine underneath is gasoline, diesel, or
electric, a universal remote control's buttons working across
completely different brands of TV, USB working the same way for a
keyboard, a mouse, or a flash drive, SQL querying wildly different
underlying database engines through one shared language
```

### SE lens

The alternative — a completely separate, purpose-built command just for
listing environment variables, sharing no code or concepts with the
command that lists files — would be simpler to understand in isolation,
at the real cost of the reader (and PowerShell's own implementers) having
to learn an entirely new, unrelated set of behaviors and flags for
something that is, conceptually, the exact same operation: "list what's
here." Building environment variables as one more thing `Get-ChildItem`
can already list, through the provider abstraction above, trades a small
amount of extra conceptual overhead up front (you have to learn that
`Env:` is a "drive" at all) for a real, ongoing payoff: everything
already learned about `Get-ChildItem`, `Sort-Object`, and
`Select-Object` from working with real files carries over immediately,
with nothing new to learn syntactically.

### Commands needed

- **`Get-ChildItem Env:`** — already explained fully above.
- **`Sort-Object <property>`**, **`Select-Object -First N <property>`** —
  both explained fully above.

### Run it

Both real outputs shown above come from actually running these commands
on this machine — per the Verification Rule, the real, current count and
contents of this process's environment variables (and the real number of
`PATH` entries) cannot be predicted in advance and were captured for
real, saved in `src/docs/flutter/verification/lesson-02/run-log.md`.

### Connecting this unit

This unit revisited Lesson 1's environment variables using this lesson's
own filesystem-listing tools, showing they generalize further than
Concept Unit 4 alone suggested. The next unit does the same thing for
processes: Lesson 1 only ever *observed* them through Task Manager; this
lesson's final process-focused unit controls one directly.

---

## Concept Unit: Processes, From the Terminal

### The Problem

Lesson 1's Concept Unit 2 established what a process is and proved,
using Task Manager, that real, concurrent processes exist with their own
PIDs and RAM usage — but every process observed there already existed on
its own; nothing in Lesson 1 started one deliberately from the terminal,
or ended one on purpose. Can a process be created — and forcibly
destroyed — directly from a command, the same way a file just was?

> **Stop and think before reading on:** This lesson's own Concept Unit 5
> already showed a create/destroy pair for files: `New-Item` and
> `Remove-Item`. Given that a process is also a real, OS-tracked thing
> with a clear beginning and end, what do you think the equivalent
> create/destroy pair of commands for a *process* might be named, if
> PowerShell's own naming pattern (`Verb-Noun`) holds?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None — this unit starts and stops a real process;
  it does not touch the filesystem.
- **Change type:** N/A — process lifecycle, not a file change.
- **Location:** Any PowerShell terminal.
- **Dependencies:** A real, installed program to launch — this unit uses
  Notepad, already present on every Windows installation.

### The New Code

```powershell
$proc = Start-Process notepad -PassThru
$proc.Id
Get-Process -Id $proc.Id
Stop-Process -Id $proc.Id
Get-Process -Id $proc.Id
```

### The Updated Project

Not applicable — freestanding commands.

### Introduce the concept in isolation

Real, captured output from running exactly that sequence:

```
34964

   Id ProcessName RAM_MB
   -- ----------- ------
34964 Notepad      18.20

Cannot find a process with the process identifier 34964.
```

A real Notepad window really opened on screen the instant
`Start-Process` ran (proof beyond even this text output — this unit's
author watched it happen). `$proc.Id` reports its real, genuine process
ID, `34964` — a different number every time this is run, exactly as
Lesson 1 predicted for any newly-started process. `Get-Process -Id`
confirms it's really running, with real RAM usage. `Stop-Process`
produces no output on success — but the *second* `Get-Process -Id` call,
targeting that exact same PID, now fails with a real error: direct,
checkable proof the process is genuinely gone, not just minimized or
hidden, and — concretely — the Notepad window really did close on
screen the instant `Stop-Process` ran.

### Discarding this example

PID `34964` will never be reused by this specific curriculum again — PIDs
are reassigned by the OS, not reserved once used. What carries forward:
a process can be started and forcibly ended directly from the terminal,
with real, checkable proof of both — this pattern is called **process
control**, and everything this lesson's own `flutter run` (soon, in
Phase 3) or a Sudoku game's own background timer will eventually rely on
sits on top of exactly this same underlying capability.

### Mechanical walkthrough

- **`Start-Process notepad -PassThru`** — already given full CRC
  treatment above; `notepad` is the bare name of the program to launch
  (found via `PATH`, exactly as Lesson 1's Concept Unit 4 explained bare
  command names are resolved); `-PassThru` (already given a real Terms
  entry above, as a PowerShell parameter) is what makes this call hand
  back an object at all, captured into `$proc`.
- **`$proc.Id`** — property access: reading the `Id` property off the
  object `Start-Process` returned — the exact same shape of operation
  (name, dot, property name) that will reappear constantly once this
  curriculum reaches real Dart objects, starting Lesson 11.
- **`Get-Process -Id $proc.Id`** (first call) — already given full CRC
  treatment above; its `-Id` parameter is given `$proc.Id`'s real value,
  not typed as a literal number, so this exact code works correctly no
  matter what real PID the OS happens to assign this specific run.
- **`Stop-Process -Id $proc.Id`** — already given full CRC treatment
  above; same targeting pattern as the `Get-Process` call just before it.
- **`Get-Process -Id $proc.Id`** (second call) — the identical command as
  the first call, syntactically — its real, different *result* (a real
  error instead of a real process report) is entirely due to real state
  having changed in between, not anything different about the command
  itself.

### CS lens

Starting a process, letting it run, and later forcibly ending it based on
a decision made by *another* process (this shell, not Notepad itself
choosing to close) is a real, concrete instance of **process
supervision** — one process managing the lifecycle of another. This
exact pattern, generalized, is what an operating system's own task
manager does constantly, what a server does when it starts and later
kills a worker process that's misbehaving, and — much later in this
curriculum — what Flutter's own tooling does every time `flutter run`
starts your app as a separate process it can later stop on your command.

```
Also recognized in: a supervisor ending a specific employee's task
assignment, a circuit breaker cutting power to one specific
appliance, an operating system's own "End Task" button in Task
Manager, a container orchestration system (like Kubernetes)
restarting a crashed container
```

### SE lens

Ending a process this way — `Stop-Process`, an abrupt, forced
termination — is a real, meaningfully different operation from asking a
program to close itself gracefully (clicking its own window's close
button, which gives the program a chance to save unsaved work first).
The real tradeoff: `Stop-Process` is reliable and immediate even against
a completely frozen, unresponsive program — exactly the case where a
graceful close request would never get answered at all — at the cost of
giving that process zero opportunity to clean up, save data, or finish
anything in progress. This exact distinction becomes directly relevant
once this curriculum reaches Lesson 54 (Saving games): a game that only
saves progress on a graceful close would lose that progress entirely if
its process were ever forcibly stopped instead.

### Commands needed

- **`Start-Process <program> -PassThru`**, **`Get-Process -Id <id>`**,
  **`Stop-Process -Id <id>`** — all already given full treatment above.

### Run it

The real PID, real RAM figure, and real "cannot find a process" error
shown above all come from actually running this exact sequence on this
machine — per the Verification Rule, a process's real, freshly-assigned
PID and its real RAM usage cannot be predicted in advance, and the exact
wording of the real error after stopping it is exactly the kind of error
text that has to be captured for real, not guessed at. Saved in full in
`src/docs/flutter/verification/lesson-02/run-log.md`.

### Connecting this unit

This unit extended Lesson 1's process concept from pure observation to
real control — starting and forcibly ending one, with real proof of
both. One category of "thing this curriculum interacts with from the
terminal" remains: real, installed software, inspected (not created or
destroyed) through a different kind of tool entirely.

---

## Concept Unit: Package Managers

### The Problem

Lesson 1's entire SDK install was done by hand: download a `.zip` file,
extract it to a specific folder, edit `PATH` to point at it. That worked,
but it required knowing, in advance, exactly where to download Flutter
from, exactly where to put it, and exactly which folder to add to
`PATH`. Most software a developer installs is not obtained this
carefully by hand every time. What does modern software installation
usually look like instead, and does this machine already have a tool for
it?

> **Stop and think before reading on:** Given Lesson 1's own manual
> install process — download, extract, configure `PATH` by hand — what
> repetitive, error-prone parts of that process do you think a dedicated
> tool could reasonably automate, if one existed? What would such a tool
> need to know about a piece of software in order to install, update, or
> remove it correctly, without a human manually tracking any of that?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None — this unit only inspects already-installed
  software; it installs nothing new.
- **Change type:** N/A — observation.
- **Location:** Any terminal.
- **Dependencies:** `winget`, already present on this machine (confirmed
  by this unit's own real, run output) — it ships built into modern
  Windows.

### The New Code

```powershell
winget --version
winget list --id Microsoft.VisualStudioCode --accept-source-agreements
```

### The Updated Project

Not applicable — freestanding commands.

### Introduce the concept in isolation

Real, captured output:

```
v1.29.290

Name                                Id                                                               Version   Source
----------------------------------------------------------------------------------------------------------------------
Microsoft Visual Studio Code (User) Microsoft.VisualStudioCode                                       1.134.0   winget
Visual Studio Code                  MSIX\Microsoft.VisualStudioCode_1.0.134.0_neutral__8wekyb3d8bbwe 1.0.134.0
```

This real output proves `winget` genuinely knows, without being told any
file paths or folder locations, exactly what version of a specific,
named piece of software is currently installed on this machine —
information Lesson 1's own manual Flutter install had no equivalent way
to ask for; the only way to check that install's version was running
`flutter --version` itself, a tool specific to Flutter alone, not a
general answer for "what's installed on this machine."

### Discarding this example

The exact version numbers shown (`1.134.0`, and this specific real VS
Code install) will drift out of date the moment either is updated —
disposable facts about this one machine, right now. What carries
forward: a package manager can answer "is this installed, and what
version" for arbitrary software, by name, without the human tracking any
file paths themselves.

### Mechanical walkthrough

- **`winget`** — already given full CRC treatment in this lesson's
  header.
- **`--version`** — already given a real Terms entry in Lesson 1 (a
  command-line flag): reappearing here on a different real program,
  proving the same convention (a bare, no-value switch reporting version
  and exiting) is not specific to `flutter` — it is a broadly shared
  convention across many, unrelated command-line programs.
- **`list`** — `winget`'s subcommand for checking on installed packages,
  the specific corner of its full CRC entry this lesson uses.
- **`--id Microsoft.VisualStudioCode`** — a parameter narrowing the
  search to one exact, specific package, identified by its real,
  registered package ID (`Microsoft.VisualStudioCode`) rather than a
  loose, ambiguous name search.
- **`--accept-source-agreements`** — a flag suppressing an interactive
  prompt `winget` would otherwise show the first time it contacts its
  package source in a given session, asking the user to accept that
  source's terms; included here purely so this lesson's real, captured
  output shows only the actual result, not an unrelated one-time prompt.

### CS lens

A package manager tracking, for every installed package, exactly what's
installed, at what version, and (though not shown in this lesson's
narrow real example) what else it depends on, is a real instance of
**dependency management** — keeping an accurate, queryable record of
what a system actually has, rather than trusting memory or documentation
that can silently drift out of date. This exact idea, in a more focused
form, reappears the moment this curriculum creates a real Flutter
project: Dart's own package manager, `pub` (met properly once a real
`pubspec.yaml` exists, Phase 3), tracks this project's own package
dependencies the same fundamental way `winget` just tracked this whole
machine's installed software.

```
Also recognized in: a pharmacy's prescription records tracking
exactly what a patient is currently taking, a warehouse's inventory
system, a car's own maintenance record tracking which parts have
been replaced and when, a library's catalog tracking which books
are currently checked out and by whom
```

### SE lens

Lesson 1's manual install (download, extract, edit `PATH` by hand) and a
package-manager-driven install represent a real, direct tradeoff: doing
it by hand gives complete, transparent visibility into exactly what
happened and exactly where every file landed — valuable specifically
*because* Lesson 1 needed to teach what an SDK install actually is,
mechanically, not hide it behind one opaque command. A package manager
trades that visibility away, in ordinary day-to-day use, for reliability
and repeatability: the same install command produces the same correct
result every time, without a human needing to remember (or re-derive) the
exact steps Lesson 1 walked through by hand. Both are the right tool for
different moments — this lesson deliberately used Lesson 1's manual
approach exactly once, for teaching, and will lean on package managers
(`winget` here; `pub`, later, for Dart packages) for everything
afterward.

### Commands needed

- **`winget --version`** — reports the installed Windows Package Manager
  version; success looks like real version text, shown above.
- **`winget list --id <package-id> --accept-source-agreements`** —
  reports whether a specific package is installed and its real, current
  version; success looks like a real table row matching that package,
  shown above.

### Run it

Both real outputs shown above come from actually running these commands
on this machine — per the Verification Rule, whether a specific named
package is currently installed, and at exactly what version, is real,
current machine state that cannot be predicted in advance, and was
checked for real, saved in
`src/docs/flutter/verification/lesson-02/run-log.md`.

### Connecting this unit

This unit closes the loop this lesson opened by referring back to Lesson
1's own manual install: everything done by hand there — finding,
downloading, tracking versions of software — has a terminal-native,
automatable counterpart in a package manager. Phase 3 of this curriculum
will lean on exactly this idea again, once Dart's own package manager,
`pub`, starts managing this project's real dependencies the same way.

---

## Connect the Pieces

Start to finish, one concrete thread through every unit this lesson
built, following one real, disposable practice folder from creation to
deletion, alongside two other real, controlled things:

1. **Concept Unit 1** established that this curriculum's own real folder
   structure is a tree of files and directories — the ground every other
   unit in this lesson stands on.
2. **Concept Unit 2** proved, with a real `Resolve-Path` run, that the
   relative path `.\sudoku_notes\ideas.txt` and its full absolute form
   name the exact same real file.
3. **Concept Unit 3** proved, with three real `Get-Location` calls
   around two real `Set-Location` calls, that the shell's current working
   directory is real, mutable, per-process state — exactly the kind of
   state Lesson 1 predicted a process would have.
4. **Concept Unit 4** proved, with real `Get-ChildItem` output, exactly
   what files and directories are really present at each step.
5. **Concept Unit 5** created `sudoku_notes\ideas.txt` for real with
   `New-Item`, then destroyed both for real with `Remove-Item`, proving
   both with real `Test-Path` results — the complete life of this
   lesson's one running example, start to end.
6. **Concept Unit 6** turned the exact same `Get-ChildItem` tool from
   Concept Unit 4 on a completely different kind of thing — environment
   variables — and split `PATH` apart for the first time to reveal its
   real, 84-entry internal structure on this machine.
7. **Concept Unit 7** started and forcibly ended one real process
   (Notepad, PID `34964` on this real run), proving Lesson 1's
   observation-only relationship with processes has a real, terminal-
   native control counterpart.
8. **Concept Unit 8** closed the lesson by connecting back to Lesson 1's
   own manual SDK install: `winget` answered, for real, a question that
   install had no dedicated tool for at all — what's installed, and at
   what version.

Every one of Lesson 1's GUI-based tools — File Explorer, Task Manager,
the Environment Variables dialog — now has a real, precise, terminal-
native counterpart this lesson actually ran: `Get-ChildItem`/`New-Item`/
`Remove-Item` for File Explorer, `Get-Process`/`Start-Process`/
`Stop-Process` for Task Manager, and `Get-ChildItem Env:` for the
Environment Variables dialog. Lesson 4 turns to a different, related
skill this curriculum will lean on constantly from here forward: reading
documentation and diagnosing errors — including the real ones this very
lesson's own `Remove-Item` and `Get-Process` calls would produce if
pointed at something that doesn't exist.
