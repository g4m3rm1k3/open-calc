# Lesson 01: Starting the Right Way — Project Setup, Git, and Package Structure

**What you will build:** A brand-new Android Studio project — not a
continuation of `android-ui-foundations`' own project, a real, separate
one — with version control started *before* a single line of generated
code is touched, and a package structure organized by feature instead
of by layer. The transferable problem: `android-ui-foundations` Lesson
05 already taught the compiler-enforced mechanics of a package
declaration; nothing yet has taught the *design* decision of how to
organize packages as a real project grows past one screen, or the real,
professional habit of treating version control as part of a project's
first minute, not an afterthought once something's already worth
losing.

**What you need to know first:** `android-ui-foundations` Lesson 05
(package declarations, the wizard, the reversed-domain naming
convention). This lesson assumes familiarity with `git` at the command
line (`git init`, `git add`, `git commit`) — not taught here as new
material, applied here as a real, deliberate habit.

**Terms introduced in this lesson:**
- **Package-by-layer** — organizing packages by a class's *technical
  role* (`activities`, `adapters`, `models`), so that one feature's
  files are scattered across several packages.
- **Package-by-feature** — organizing packages by *what part of the app
  a class belongs to* (`login`, `inventory`, `notifications`), so that
  every file one feature actually needs sits in one place.
- **`.gitignore`** — a real file listing paths `git` should never track,
  specifically so generated, machine-specific, or rebuildable files
  never enter version history at all.
- **`core/`** — this project's own name for the one deliberate exception
  to package-by-feature: a package holding classes genuinely shared
  across more than one feature, rather than owned by any single one.

**Objects and methods used:** none — this lesson is project structure
and tooling, not Java code.

---

## Concept Unit: Package-by-Layer vs. Package-by-Feature

### The Problem

`android-ui-foundations` never had more than one real feature area — a
login screen, a grid, a notifications screen, all fairly small. This
project's own final shape (login, inventory, notifications, each with
real Java classes: a `ViewModel`, a `Repository`, an `Entity`, an
`Adapter`) is genuinely larger, and *where* each new class physically
lives is a real, first design decision, not a detail to default on
without thinking.

### The Options, Weighed

**Package-by-layer** — one package per technical role:

```
com.yourname.inventoryapp/
├── activities/
│   ├── LoginActivity.java
│   └── InventoryActivity.java
├── viewmodels/
│   ├── LoginViewModel.java
│   └── InventoryViewModel.java
├── repositories/
│   ├── UserRepository.java
│   └── ItemRepository.java
└── database/
    ├── UserEntity.java
    └── ItemEntity.java
```

Every class belonging to the *login* feature — `LoginActivity`,
`LoginViewModel`, `UserRepository`, `UserEntity` — sits in four
different, unrelated top-level packages.

**Package-by-feature** — one package per real feature area:

```
com.yourname.inventoryapp/
├── login/
│   ├── LoginActivity.java
│   ├── LoginViewModel.java
│   ├── UserRepository.java
│   └── UserEntity.java
├── inventory/
│   ├── InventoryActivity.java
│   ├── InventoryViewModel.java
│   ├── ItemRepository.java
│   └── ItemEntity.java
└── core/
    └── AppDatabase.java
```

Every class the login feature needs sits together, in one package;
`core/` holds only what's genuinely shared across more than one
feature (the database class itself, next lesson's own subject).

### Proving the Difference for Real

Build both real folder structures shown above (empty files are enough —
`touch` each one) and search each for every file the login feature
actually needs:

```bash
# package-by-layer
find by-layer -name "*Login*"

# package-by-feature
find by-feature -path "*/login/*"
```

Real output, from running this just now:

```
by-layer/com/yourname/inventoryapp/activities/LoginActivity.java
by-layer/com/yourname/inventoryapp/viewmodels/LoginViewModel.java

by-feature/com/yourname/inventoryapp/login/LoginActivity.java
by-feature/com/yourname/inventoryapp/login/LoginViewModel.java
by-feature/com/yourname/inventoryapp/login/UserRepository.java
```

Notice the by-layer search — matching the filename pattern `*Login*` —
only finds the files literally named with "Login" in them, missing
`UserRepository.java` entirely (a real file the login feature genuinely
needs, just not named to indicate it). The by-feature search — matching
the real *path*, `login/`, not a filename pattern — finds every file
the feature actually owns, correctly, regardless of what each one is
individually named.

### The Tradeoff

Package-by-layer groups files by what *kind of thing* they are —
useful, at a glance, for "show me every `ViewModel` in this project" —
at the real cost that understanding or changing one complete feature
means opening files scattered across four or five unrelated top-level
packages, every time. Package-by-feature groups files by what they're
*for* — opening the `login` package shows the entire login feature, top
to bottom, in one place — at the cost that "show me every `ViewModel`"
now means looking inside every feature package individually.

**This project organizes by feature**, since real, professional Android
codebases consistently favor it once a project grows past a handful of
classes — the day-to-day task of "I need to change how login works" is
far more common than "show me every `ViewModel` in isolation," and
package-by-feature optimizes directly for the more common task. This is
a genuine, real industry preference, not an arbitrary choice invented
for this lesson.

### Mechanical Walkthrough

- `activities/`, `viewmodels/`, `repositories/`, `database/` — the
  package-by-layer shape: each top-level folder name describes a
  *technical role*, never a feature; `LoginActivity` and
  `LoginViewModel` share no folder at all, despite belonging to the
  exact same feature.
- `login/`, `inventory/`, `core/` — the package-by-feature shape this
  project actually adopts: each top-level folder name describes a real
  *part of the app*; every file the login feature needs — its
  `Activity`, its `ViewModel`, its `Repository`, its `Entity` — sits
  inside the one `login/` folder together.
- `core/` — **first appearance.** The one deliberate exception to
  "everything lives inside its own feature folder": a class like
  `AppDatabase` (next lesson) is genuinely shared *across* features, not
  owned by any single one, and belongs in a real, separate location
  named for exactly that reason, rather than arbitrarily nested inside
  whichever feature happened to need it first.

### CS Lens

This is the same **cohesion** principle software design applies at
every scale, from a single class's own methods up to an entire
codebase's folder structure: things that change together should live
together. A change to how login works, under package-by-feature,
touches files in exactly one folder; the identical change, under
package-by-layer, touches one file each in four or five separate
folders — the same real work, a meaningfully different real cost to
navigate correctly.

Also recognized in: modern JavaScript/React project conventions
(component-per-feature folders, each holding its own styles, tests, and
logic together), and the general "high cohesion, low coupling" software
design principle taught across virtually every real engineering
curriculum, not invented for Android specifically.

### SE Lens

**Why does this matter more here than it did in `android-ui-foundations`?**
That project's own final shape — three Activities, one Adapter, a
handful of small classes — was genuinely small enough that package
organization barely mattered; everything fit on one mental map without
effort. This project's real architecture (a `ViewModel`, a
`Repository`, an `Entity`, and a `Dao` *per feature*, starting next
lesson) roughly quadruples the file count for the identical feature
set — exactly the scale where an organizing principle chosen
deliberately, from the first file, pays for itself, instead of being a
painful, project-wide rename applied under pressure later.

---

## Concept Unit: Version Control From Commit Zero

### The Problem

`android-ui-foundations` Lesson 05 mentioned `git init` only in passing,
as part of that lesson's own closing checklist — real, but not this
project's own subject there. A real professional habit is stricter:
version control starts *before* the first real line of code is
written, specifically so the project's own starting point — exactly
what the wizard generated, nothing more — is itself a real, recoverable
commit.

### Project Change

- **Reference Source:** No external framework signature — this is
  tooling and process, not a framework API.
- **Files affected:** A new `.gitignore` file; the entire generated
  project, committed once, unmodified.
- **Change type:** Initialize a repository; commit the wizard's own
  output before touching anything.
- **Dependencies:** None.

### The New Code

Immediately after the wizard finishes generating the project — before
opening a single file to read or edit it:

```bash
cd YourAppName
git init
```

Android Studio's own wizard already generates a real, correct
`.gitignore` — open it and confirm it excludes, at minimum:

```
*.iml
.gradle
/local.properties
/.idea
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
```

Stage and commit everything exactly as generated:

```bash
git add .
git commit -m "Initial project scaffold from Android Studio wizard"
```

### Mechanical Walkthrough

- `git init` — creates a real, empty `.git` repository, rooted at the
  project's own top-level folder — nothing is tracked yet, only the
  capability to track exists so far.
- `.gitignore`'s real entries — `.gradle`/`/build` hold generated,
  rebuildable output, never hand-edited and never meaningfully
  reviewable as a diff; `/local.properties` holds a path specific to
  *your own machine* (where your Android SDK is installed) that would
  break a teammate's own build if committed and blindly reused;
  `/.idea` (partially — some of its own contents are legitimately
  shared, most are not) and `*.iml` hold per-developer IDE state, not
  project source. None of these are source code a teammate needs from
  version control at all; committing any of them is a real, common
  mistake this file exists specifically to prevent by default.
- `git add .` / `git commit -m "..."` — the same two real commands
  underlying every commit this entire repository's own curricula have
  already asked you to make since `android-ui-foundations` Lesson 05 —
  reappearing here as the very first commit in a brand-new repository,
  deliberately, before any of this lesson's own architectural decisions
  are even made.

### CS Lens

Committing the wizard's own unmodified output as the real first commit
establishes a genuine, recoverable baseline — every later change in
this entire series, from here forward, is a real, reviewable diff
against a known-good starting point, rather than an undifferentiated
mass of "everything since the project began."

### SE Lens

**Why commit the wizard's own generated code at all, before writing
anything meaningful — isn't the first "real" commit the one that
matters?** A repository with no history before the first feature commit
loses a genuinely useful reference point: "what did this project look
like before *any* of my own code existed" — useful when debugging a
build configuration issue later, and useful as an honest record of
exactly how much of a real Android project is generated scaffolding
versus a project's own actual work. Establishing the habit here, on a
project this small, is what makes it automatic on a much larger one
later, where skipping it is a genuinely costlier mistake.

---

## Concept Unit: Creating the Project

### The Problem

Both of this lesson's own real decisions — commit before editing,
organize by feature — need an actual project to apply them to. The
wizard sequence itself is already-familiar ground; what's new is the
*order* this lesson runs it in.

### The New Code

The same wizard sequence `android-ui-foundations` Lesson 05 already
walked through, real reminders only where the decision itself repeats,
with this lesson's own two new decisions folded in:

1. **New Project → Empty Views Activity.**
2. **Name:** a real, new name — this is a genuinely separate project
   from `android-ui-foundations`', not a continuation of it.
3. **Package name:** the same reversed-domain convention
   (`android-ui-foundations` Lesson 05's own concept, reappearing) —
   `com.yourname.inventoryapp`, or your own real equivalent.
4. **Language: Java.**
5. **Minimum SDK:** the suggested default.
6. Click **Finish**, then immediately follow this lesson's own
   git-first sequence above — before opening `MainActivity.java` to
   look at it.
7. Once committed, create the real package-by-feature structure this
   lesson chose: right-click `com.yourname.inventoryapp` → **New →
   Package**, creating `login`, `inventory`, and `core` — empty for
   now, real homes for the classes the next several lessons build.

### The Updated Project

`MainActivity.java`, wherever the wizard placed it, is untouched by
this lesson — its own real content is `android-ui-foundations`' own,
already-familiar territory. What's different here is entirely
structural: three new, empty packages exist alongside it, and a real
git history — one commit — already exists before any of them hold
anything.

### Mechanical Walkthrough

- Steps 1–5 — the identical wizard sequence `android-ui-foundations`
  Lesson 05 already walked through in full; nothing about the wizard
  itself is different here.
- Step 6 — **first appearance of this lesson's own reordering.** The
  git-first sequence from the previous Concept Unit runs *immediately*
  after **Finish**, before `MainActivity.java` is ever opened —
  deliberately, so the very first commit genuinely contains nothing but
  the wizard's own output.
- Step 7 — this lesson's own package-by-feature decision, made real:
  three real, empty packages, created once, before any class exists
  that needs one.

### SE Lens

**Why walk through the identical wizard steps again here, rather than
simply pointing back to `android-ui-foundations` Lesson 05 and skipping
straight to what's different?** The wizard's own steps are genuinely
unchanged (per the Repetition Rule, reappearing here as a real, brief
reminder, not full re-treatment) — what's new and worth seeing in full,
in order, is this lesson's own reordering around it: commit *before*
exploring, structure *before* populating. Seeing the full real sequence,
including the familiar parts, is what makes the new order legible as a
deliberate choice rather than an isolated detail.

---

## Connect the Pieces

One trace through this lesson: the wizard generated a real, working
project exactly as it did in `android-ui-foundations` Lesson 05 — that
mechanism hasn't changed. What's new is the order of operations around
it: `git init` and one real commit happened *before* any exploration or
editing, establishing a recoverable baseline this series can diff every
future lesson's real changes against; and three real, empty packages —
`login`, `inventory`, `core` — exist as a deliberate structural decision,
made once, before the classes that will need homes are ever written,
rather than reorganized under pressure once dozens of files already
exist in the wrong place.

## What Breaks Without This

Skipping `.gitignore` entirely and running `git add .` regardless: real,
observable result — `git status` afterward shows `/build`'s own
generated `.class` files, `.gradle`'s own cache, and `local.properties`
(a file containing your own machine's local SDK path) all staged for a
commit. Committing `local.properties` specifically is a real, common,
concrete mistake: a teammate pulling this commit would have their own,
different local SDK path silently overwritten by yours the next time
they open the project, breaking their build for a reason that looks
nothing like its real cause. Confirm your own `.gitignore` excludes it
before your first real commit, not after discovering this the hard way.

## Exercises

1. Run `git log --stat` after your first commit and confirm exactly
   what the wizard actually generates for you, file by file — a real,
   concrete inventory of "scaffolding" versus what every future lesson
   in this series will actually add.
2. Sketch, on paper or in a scratch text file, what a *third* feature
   this app doesn't have yet (a "reports" screen, say) would look like
   added to this lesson's package-by-feature structure versus the
   package-by-layer alternative — confirm for yourself which one keeps
   the new feature's own files together.
3. Deliberately commit `local.properties` once (temporarily remove it
   from `.gitignore`), then correctly remove it from tracking with
   `git rm --cached local.properties` and restore the `.gitignore`
   entry — direct, hands-on practice with the real fix for a mistake
   worth being able to correct, not just avoid.

## Definition of Done

- [ ] A new, real Android Studio project exists, separate from
      `android-ui-foundations`' own.
- [ ] `git init` ran, and a real first commit exists containing the
      wizard's own unmodified output.
- [ ] `.gitignore` correctly excludes `local.properties`, `/build`,
      `.gradle`, and IDE-specific files — confirmed by running `git
      status` and seeing none of them listed as untracked or staged.
- [ ] Three real, empty packages exist: `login`, `inventory`, `core`.
- [ ] You can explain, concretely, one real cost package-by-layer would
      have imposed on this specific project as it grows, and why
      package-by-feature avoids it.
- [ ] Commit: `git commit -m "Add package-by-feature structure"` — the
      second real commit in this project's history, after the
      unmodified-scaffolding first one.

Next: reproducing the real, concrete problem `android-ui-foundations`
never had to face — data silently lost on rotation — before fixing it
with the pattern this entire series is really about.
