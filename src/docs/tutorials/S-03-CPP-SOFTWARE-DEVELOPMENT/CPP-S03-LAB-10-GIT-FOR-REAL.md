# Lesson 10: A Branch Is a Question You Haven't Answered Yet
### (LAB 10 — Git for Real)

**What you will build:** A real, small repository taken through the full workflow every lesson in this curriculum has quietly asked you to perform without ever explaining: stage and commit, branch to try something, merge it back, deliberately create a real conflict (two branches editing the same line differently) and resolve it by hand, then push to a remote and clone it elsewhere to prove collaboration actually works. The transferable problem: every "Definition of done" checklist since `S-01-CPP-FOUNDATIONS` LAB-00 has ended with `git commit`, treated as a single, isolated action. Real software development is rarely one person committing in a straight line — it's branches, merges, and conflicts, and this lesson is where those stop being words and become things you've actually done.

**What you need to know first:** Nothing C++-specific — this lesson is entirely about the tool, not the language. Familiarity with `git add`/`git commit`, used mechanically throughout this curriculum's own Definition of Done checklists.

**Terms introduced in this lesson**

> **Working directory** — the files on disk as they currently are, including any uncommitted edits.
> **Staging area (index)** — a holding area for changes selected (via `git add`) to be included in the *next* commit.
> **Commit** — a permanent, named snapshot of the staging area's contents at a point in time.
> **Branch** — a movable pointer to a commit, letting separate lines of work exist without interfering with each other until merged.
> **Merge** — combining one branch's commits into another; a **fast-forward** merge simply moves a pointer forward when no divergence occurred; a **real merge** creates a new commit joining two diverged histories.
> **Merge conflict** — occurs when two branches changed the same lines differently; git cannot decide automatically which version to keep and requires a human resolution.
> **Remote** — a copy of a repository's history hosted elsewhere (a server, or another machine), synchronized via `push`/`pull`/`clone`.

No pipeline diagram applies — this lesson's own real, small git repository is the entire subject.

---

## Concept Unit 1: The Three States — Working Directory, Staging Area, Commit

### The Problem

Every lesson in this curriculum has run `git add` then `git commit` as a fixed, unexplained ritual — two commands, back to back, with no stated reason there are two at all instead of one.

### Concept Lab

```
$ git init
$ echo "int main() { return 0; }" > main.cpp
$ git status --short
?? main.cpp
```

Verified this session — a newly created `main.cpp`, never added, shows `??` — **untracked**: git sees the file exists but has never been told to track it at all.

```
$ git add main.cpp
$ git status --short
A  main.cpp
```

Adding it changes its status to `A` (added/staged) — the file's current contents are now recorded in the **staging area**, ready to be included in the next commit, but nothing permanent has happened yet.

```
$ git commit -m "Initial commit: empty main"
$ git status --short
(no output -- clean)
$ git log --oneline
fa65969 Initial commit: empty main
```

What that proves: three genuinely distinct states — a file can be **modified** (changed on disk, not yet staged), **staged** (marked for the next commit, via `git add`), or **committed** (permanently recorded in the repository's history, via `git commit`). `git status` reports which state every file is currently in; `git log` shows the permanent record once committed.

### Mechanical Walkthrough

- `git status --short` — **(a) first appearance of `--short`.** A compact status format — `??` for untracked, `A` for staged-added, `M` for staged-or-unstaged-modified (distinguished by column position, covered fully in Concept Unit 5).
- `git add main.cpp` — **(c) reusing** a command this whole curriculum has run without full explanation — moves `main.cpp`'s current on-disk contents into the staging area.
- `git commit -m "..."` — **(c) reusing** the identical command — permanently records the staging area's current contents as a new commit, with the given message.

### CS Lens

The staging area exists specifically so a commit can be *exactly* what was intended — a developer can stage only some of several changed files (or, with more advanced commands not covered here, only part of one file), building a commit deliberately, rather than being forced to commit everything currently modified on disk in one lump.

### SE Lens

Every commit message in this curriculum's own Definition of Done checklists has stated a rule: explain *why* the change was made, not merely what changed — `git log`'s permanent record is read by future you, and by teammates, far more often than it's written; a message like `"Add Warrior class stub"` (this lesson's own next commit) is only useful if it's honest about what actually happened.

### Connection

Concept Unit 2 introduces the tool that makes committing to two *different* lines of work, at once, possible — a branch.

---

## Concept Unit 2: Branching — Trying Something Without Touching `main`

### The Problem

Working on a new feature directly on the same line of history as everything else means an unfinished, possibly-broken change sits mixed in with working code — nothing separates "this is done and correct" from "this is in progress."

### Concept Lab

```
$ git branch -M main
$ git switch -c add-warrior
Switched to a new branch 'add-warrior'
```

Verified this session — `git switch -c add-warrior` created a new branch, `add-warrior`, and moved to it in one step; `main` itself is untouched.

```
$ echo "int main() { /* warrior class here */ return 0; }" > main.cpp
$ git commit -aq -m "Add Warrior class stub"
$ git log --oneline --all --graph
* 29fa0ab Add Warrior class stub
* fa65969 Initial commit: empty main
```

What that proves: a new commit was added, but only on `add-warrior` — `main` still points at the original commit. Merging it back in, since no other commits happened on `main` in the meantime:

```
$ git switch main
$ git merge add-warrior --no-edit
Updating fa65969..29fa0ab
Fast-forward
 main.cpp | 2 +-
```

What that proves: a **fast-forward** merge — since `main` never diverged (no new commits were made on `main` while `add-warrior` was being worked on), merging is trivial: `main`'s own pointer simply moves forward to match `add-warrior`'s latest commit, with no new merge commit created at all.

### Mechanical Walkthrough

- `git switch -c add-warrior` — **(a) first appearance.** Creates a new branch pointer at the current commit and switches the working directory to reflect it — `-c` (create) combines what older git versions required as two separate commands (`git branch` then `git checkout`).
- `git merge add-warrior` — **(a) first appearance.** Combines `add-warrior`'s history into the currently checked-out branch (`main`, here) — a fast-forward specifically when no divergence occurred, verified above.

### CS Lens

A branch is not a copy of the project's files — it is a lightweight pointer to a specific commit. Creating one is nearly instantaneous regardless of project size, because nothing is duplicated; only a new named pointer is created, and `git switch` changes which commit's contents populate the working directory.

### SE Lens

This is the mechanism that lets real teams work in parallel: each person branches from a shared starting point, commits independently, and merges back — without one person's in-progress, possibly-broken work ever being visible on `main` until it's ready and merged.

### Connection

Concept Unit 3 shows what happens when two branches *do* diverge — genuinely, on the same lines — and merging is no longer a trivial fast-forward.

---

## Concept Unit 3: A Real Merge Conflict — and Resolving One by Hand

### The Problem

Two branches, each editing the identical line of the identical file differently, cannot both be "the" answer when merged — git has no way to guess which change should win.

### Concept Lab

```
$ echo "int hp = 100;" > stats.cpp && git add stats.cpp && git commit -m "Add starting HP"

$ git switch -c increase-hp
$ echo "int hp = 150;" > stats.cpp
$ git commit -am "Buff starting HP to 150"

$ git switch main
$ echo "int hp = 80;" > stats.cpp
$ git commit -am "Nerf starting HP to 80"
```

Two branches, `increase-hp` and `main`, both starting from the identical `"int hp = 100;"` commit, now disagree — `150` on one, `80` on the other. Merging — verified this session:

```
$ git merge increase-hp --no-edit
Auto-merging stats.cpp
CONFLICT (content): Merge conflict in stats.cpp
Automatic merge failed; fix conflicts and then commit the result.

$ cat stats.cpp
<<<<<<< HEAD
int hp = 80;
=======
int hp = 150;
>>>>>>> increase-hp
```

What that proves: git could not decide automatically — it left **both** versions in the file, marked with real conflict markers: `<<<<<<< HEAD` through `=======` is the current branch's version (`main`, `80`); `=======` through `>>>>>>> increase-hp` is the incoming branch's version (`150`). The file, as it sits on disk right now, is not valid C++ at all — these markers must be removed by hand.

```
$ git status --short
UU stats.cpp
```

`UU` — **(a) first appearance.** Both sides (current and incoming) modified this file in conflicting ways; git is waiting for a human decision.

Resolving by hand:

```
$ echo "int hp = 100;  // compromise between 80 and 150" > stats.cpp
$ git add stats.cpp
$ git status --short
M  stats.cpp
$ git commit -m "Merge increase-hp into main, resolving HP conflict at 100"
```

What that proves: editing the file to remove the conflict markers and choose (or combine) a final answer, then `git add`-ing it, tells git "this is resolved" — the file's status changes from `UU` to a normal staged `M`, and `git commit` (with no message argument needed — a merge conflict pre-populates one, though this lesson provided an explicit one) completes the merge as a real, new commit joining both histories:

```
$ git log --oneline --graph --all
*   7c666e1 Merge increase-hp into main, resolving HP conflict at 100
|\  
| * f0dc826 Buff starting HP to 150
* | 65e7d66 Nerf starting HP to 80
|/  
* 58ed11d Add starting HP
```

The graph shape (`|\`, `|/`) visibly shows the divergence and reconvergence — unlike Concept Unit 2's fast-forward, this merge genuinely has two parent commits.

### Mechanical Walkthrough

- `<<<<<<< HEAD` / `=======` / `>>>>>>> increase-hp` — **(a) first appearance of conflict markers.** Inserted directly into the affected file's actual text — not a separate report, but the file itself, temporarily invalid, holding both versions until a human edits it back to one valid version.
- `git status --short` showing `UU` — **(a) first appearance of the merge-conflict status code.**

### CS Lens

A merge conflict is not a git error — it's git correctly recognizing it cannot safely automate a decision that requires understanding the *meaning* of the code, not just its text. Two non-overlapping changes (different files, or different lines of the same file) merge automatically, silently, because no genuine judgment call is needed; overlapping changes to the identical lines always require one.

### SE Lens

The discipline this proves, concretely: resolving a conflict means reading *both* versions, understanding what each was trying to accomplish, and producing a version that's actually correct — not simply picking one side or pasting both together and hoping. `"int hp = 100; // compromise between 80 and 150"` is a real, if simplistic, editorial decision, made by a human reading both intents — exactly the judgment git itself cannot make.

### Connection

Concept Unit 4 takes this same repository and proves it collaborates with another machine — a real remote, not a hypothetical one.

---

## Concept Unit 4: Remotes — Push, Clone, and Real Collaboration

### The Problem

Everything so far has happened on one machine, in one repository — nothing has proven that a second person, on a second machine, could actually get this same history.

### Concept Lab

```
$ git init --bare ../s03lab10-remote.git
$ git remote add origin ../s03lab10-remote.git
$ git push -u origin main
```

A **bare repository** — one with no working directory, only the underlying history — verified here standing in for a real hosted remote (a GitHub repository works identically from git's own perspective; only *where* the remote lives differs). `git remote add origin ...` names this remote `origin` (the conventional name); `git push -u origin main` uploads `main`'s commits to it, and `-u` remembers this remote/branch pairing as the default for future `git push`/`git pull` with no arguments.

```
$ cd .. && git clone s03lab10-remote.git s03lab10-teammate
$ cd s03lab10-teammate && git log --oneline
7c666e1 Merge increase-hp into main, resolving HP conflict at 100
65e7d66 Nerf starting HP to 80
f0dc826 Buff starting HP to 150
58ed11d Add starting HP
29fa0ab Add Warrior class stub
fa65969 Initial commit: empty main
```

What that proves: cloning the remote into a completely separate directory (`s03lab10-teammate`, standing in for a teammate's own machine) reproduces the *exact* same commit history, including the merge and its two parents (Concept Unit 3) — every commit, every message, byte-for-byte identical. This is real, verified proof that push/clone genuinely transfers a repository's full history, not a snapshot of only its current state.

### Mechanical Walkthrough

- `git init --bare` — **(a) first appearance.** Creates a repository with no working directory — meant only to be pushed to and pulled/cloned from, never edited directly.
- `git remote add origin <location>` — **(a) first appearance.** Registers a named remote; `<location>` can be a local path (as verified here), an SSH URL, or an HTTPS URL — git's own push/pull/clone commands work identically regardless of which.
- `git push -u origin main` — **(a) first appearance.** Uploads local commits on `main` not yet present on `origin`.
- `git clone <location> <directory>` — **(a) first appearance.** Downloads a remote's full history into a new local directory, automatically setting it up as `origin`.

### CS Lens

Every git repository holds a *complete* copy of the project's history — there is no central authority a clone depends on to function; `s03lab10-teammate`, the moment it finished cloning, has everything `s03lab10-remote.git` has, and could itself be pushed elsewhere or lost entirely without losing any committed history, as long as at least one full copy (this original repository, or the remote) survives.

### SE Lens

A **pull request** (not directly demonstrable via local commands — a feature of hosting platforms like GitHub, not git itself) is, underneath, exactly this lesson's own branch-then-merge workflow (Concept Units 2–3), with one addition: before the merge happens, the diff is posted publicly for review and discussion, and the merge itself typically happens through the platform's own interface rather than a local `git merge`. Understanding what a PR actually *does* — proposes merging one branch into another, after review — makes the platform-specific interface around it easy to pick up, because the underlying git operations are exactly what this lesson already performed by hand.

### Connection

This closes every new mechanism in this lesson — the Closing section names one remaining practical tool (`.gitignore`) and connects the full workflow.

---

## Closing

### Connect the pieces

Concept Unit 1's three states — modified, staged, committed — are what every `git add`/`git commit` pair in this curriculum's own checklists has actually been doing. Concept Unit 2's branches let separate work exist without interfering, merged back trivially when nothing diverged. Concept Unit 3's real, deliberately-created conflict proved exactly when and why a merge stops being trivial, and what resolving one by hand genuinely requires — reading both intents, not guessing. Concept Unit 4 proved, with a real second clone, that this entire history transfers intact between machines — the actual mechanism a pull request builds its review process on top of.

One practical tool worth naming here, verified this session: a `.gitignore` file listing patterns (like `build/`, this series' own Lesson 9's CMake output directory) tells git to never report those paths as untracked at all —

```
$ echo "build/" > .gitignore
$ mkdir build && echo "generated" > build/output.txt
$ git status --short
 M stats.cpp
?? .gitignore
```

`build/output.txt` never appears in `git status` at all, despite existing on disk — exactly why this series' own Lesson 9 explicitly said not to commit `build/`: a `.gitignore` entry is what makes that easy to honor by accident, not just by discipline.

### What breaks without this

Reasoned through directly from Concept Unit 3's own proof: two people working on the same file without ever branching — both committing directly to `main`, on their own separate clones, then both pushing — produces the identical conflict Concept Unit 3 demonstrated, except discovered at push time, on whichever person pushes second (`git push` refuses to upload commits that would overwrite history it doesn't have, forcing a `pull`/merge first, not exercised directly here but a direct consequence of Concept Unit 4's own "every clone holds full history" proof). Branching doesn't prevent conflicts — nothing can, when two people genuinely need to change the same lines — but it does mean the conflict surfaces as a deliberate, reviewable merge, not an accidental overwrite of a teammate's already-pushed work.

### Exercises

1. Reproduce this lesson's own full sequence yourself, in a fresh scratch repository — commit, branch, fast-forward merge, then a real conflict and its resolution — narrating, in your own commit messages, what each step is actually for.
2. Deliberately create a *non-conflicting* divergence — two branches editing *different* files, or different, non-overlapping lines of the same file — and confirm the resulting merge completes automatically, with no conflict markers, contrasting it directly against Concept Unit 3's own conflicting case.
3. Push a repository to a local bare "remote" (Concept Unit 4's own pattern), clone it a second time into a third directory, make a commit in the *second* clone, push it, then `git pull` in the *first* clone and confirm the new commit arrives correctly.
4. Write a `.gitignore` for a real CMake project (this series' own Lesson 9) covering `build/` and any other generated files your own toolchain produces — confirm `git status` stays clean immediately after a full configure-and-build cycle, with none of the generated files ever appearing as untracked.

### Definition of done

- [ ] A real repository exists, taken through commit, branch, merge, and at least one genuine, hand-resolved conflict.
- [ ] `git log --oneline --graph --all` on that repository shows a real divergence-and-reconvergence shape, not just a straight line of commits.
- [ ] A push-and-clone (or push-and-pull) cycle was performed against a real second location (a bare local repo is sufficient) and verified to transfer the full, identical history.
- [ ] You can state, from Concept Unit 1's own proof, the difference between a modified, staged, and committed file, and which command moves a file between each state.
- [ ] You can explain, using Concept Unit 3's own verified conflict, what conflict markers mean and what resolving one actually requires beyond "pick a side."
- [ ] All four Exercises completed with real, observed git output, including Exercise 3's full push/clone/commit/pull round trip.
- [ ] This lesson's own final commit itself follows the "why, not what" rule every prior lesson's Definition of Done has already required — the one rule this entire lesson has been building the mechanical understanding to actually follow well.
