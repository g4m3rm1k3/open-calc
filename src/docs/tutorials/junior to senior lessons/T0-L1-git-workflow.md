# Junior to Senior — T0·L1 — Git: Version Control Fundamentals

**Prerequisites:** A terminal (PowerShell, bash, or zsh). Git installed
(`git --version` returns a version number). No prior git knowledge assumed.

**What this lab adds:**
- A git repository tracking your work — you can go back to any saved point
- A `.gitignore` that keeps generated files out of version control
- A branch so you can try something without risking what already works
- The ability to read a merge conflict and resolve it

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have been editing a file for two hours. Something breaks and you want
>    to get back to how it was this morning. Without git, how would you do that?
> 2. Your colleague works on the same codebase. You both change the same file.
>    What happens when you try to combine your work?
> 3. What do you think the difference is between `git add` and `git commit`?
>
> *(Answers at the end of this lab)*

---

## What You Will Have When This Is Done

```
$ git log --oneline
a3f9b12 Add resolve-conflict note to contacts
e8c4d01 Start contacts list
b2f7a89 Initial commit

$ git branch
  main
* experiment

$ git status
On branch experiment
nothing to commit, working tree clean
```

You will also have a `.gitignore` file and a resolved merge conflict — both things
you will use in every project for the rest of your career.

---

## The Problem Git Solves

Before writing any git commands, open a text editor and write the following in a
file called `contacts.txt`:

```
Alice, alice@example.com
Bob, bob@example.com
```

Save it. Now delete Alice's line by mistake. Save again.

**How do you get Alice back?**

If you did not have a backup, the answer is: you do not. You retype it from memory
and hope you remember it correctly. If the file was a thousand lines of code instead
of a name, you would have lost hours of work.

Git's entire purpose is to make this impossible. Every time you commit, git
permanently stores a snapshot of your work. Going back to any snapshot takes
one command, regardless of how many changes happened since.

---

### Concept: Repository

**What it is:** A repository (repo) is a directory where git tracks every change
to every file, storing a complete history of every snapshot you have ever saved.

**The problem before:** Without a repository, your project is just files.
You have no history, no ability to go back, and no safe way to try something new.
Developers used to make backup folders — `project-v1/`, `project-final/`,
`project-final-REAL/` — which is unmanageable and error-prone.

**The solution:** A single hidden folder (`.git/`) inside your project that stores
the complete history. You do not interact with `.git/` directly — git commands
do it for you.

**What it hides:** Git hides the complexity of storing file history efficiently.
Without git, storing 100 snapshots of a file means 100 complete copies of that file.
Git stores only the *differences* between snapshots (called *diffs*), so 100 snapshots
of a 1,000-line file might use less storage than 5 complete copies.

The invariant: every snapshot is permanent and tamper-evident. Git cryptographically
signs each snapshot — if any content changes, git detects it.

**Canonical example:** A repository is like a time machine with a logbook.
Every entry in the logbook is a snapshot of the entire room at that moment.
You can jump to any entry and see exactly how the room looked. The logbook itself
lives in a small box in the corner (`.git/`) and manages itself.

**Smallest possible example:**
```bash
git init my-project    # create a new repo in a new folder
# OR
git init               # turn the current folder into a repo
```

**You will see this again in:** Every software project you ever work on.
GitHub, GitLab, Bitbucket — all of them store git repositories. Open source projects,
company codebases, your own side projects: all repos.

**Watch for:** `git init` creates the `.git/` folder inside the *current* directory.
If you run it in the wrong folder (your home directory, for example), you get a
repository that tracks everything on your computer. Always `cd` to your project
folder first.

---

## Step 1 — Create a Repository

Create a fresh folder for this lesson and initialise it as a git repository:

```bash
mkdir contacts-practice   # create the folder
cd contacts-practice      # move into it
git init                  # make it a git repository
```

Create the contacts file you had earlier:

```
contacts.txt
```

```
Alice, alice@example.com
Bob, bob@example.com
```

### SAVE AND TRY

Run this in the terminal:

```bash
git status
```

Expected output:

```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        contacts.txt

nothing added to commit but untracked files present (use "git add" to track)
```

**What this tells you:** Git sees `contacts.txt` but it is *untracked* — git is
watching the folder but has not been told to care about this file yet.

**Change something:** Create a second file called `notes.txt` with any content.
Run `git status` again. You should see both files listed as untracked.
Delete `notes.txt` and run `git status` — it disappears from the list.

---

### Concept: The Three Areas — Working Directory, Staging Area, Repository

**What it is:** Git has three distinct places a file can exist: the working
directory (your actual files), the staging area (files queued for the next snapshot),
and the repository (permanent history).

**The problem before:** If git committed every change immediately, you would
commit typos, half-finished features, and debug `console.log` statements.
You need a way to choose exactly what goes into each snapshot.

**The solution:** A staging area (also called the *index*) acts as a loading dock.
You selectively move changes from the working directory into the staging area.
Only when you run `git commit` are the staged changes permanently saved.

**What it hides:** The staging area hides the selection problem — "which of my
current changes should be part of this commit?" Without it, every commit would
be "everything I've done since last time," which produces messy history. With it,
you can work on five things and commit them as five separate, clearly-named commits.

The invariant: nothing reaches the repository without passing through the staging area.
You cannot accidentally commit a file you did not explicitly stage.

**Canonical example:** Imagine packing boxes to move house. The staging area is
the pile of things you have decided to pack but have not sealed yet. The working
directory is the rest of your flat. The repository is the moving truck — once
something is in the truck (committed), it is permanent.

```
Working directory  →  git add  →  Staging area  →  git commit  →  Repository
(your files)                       (loading dock)                   (history)
```

**Smallest possible example:**
```bash
echo "hello" > file.txt   # change working directory
git add file.txt           # move to staging area
git commit -m "Add file"   # move from staging area to repository
```

**You will see this again in:** Every git workflow for the rest of your career.
Understanding these three areas is what separates developers who know git from
developers who memorise git commands without understanding them.

**Watch for:** `git add .` stages *everything* in the current directory.
This is convenient but dangerous — you might accidentally stage files you
did not mean to commit (passwords, API keys, large binary files). In professional
work, always check `git status` after `git add .` before committing.

---

## Step 2 — Make Your First Commit

Stage `contacts.txt` and create the first snapshot:

```bash
git add contacts.txt   # move contacts.txt to the staging area
git status             # check what is staged
```

Expected after `git status`:

```
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   contacts.txt
```

The file moved from "untracked" to "Changes to be committed." Now commit it:

```bash
git commit -m "Initial commit"
```

Expected:

```
[main (root-commit) b2f7a89] Initial commit
 1 file changed, 2 insertions(+)
 create mode 100644 contacts.txt
```

### SAVE AND TRY

```bash
git log
```

Expected:

```
commit b2f7a89c4d2e1f3a... (HEAD -> main)
Author: Your Name <your@email.com>
Date:   Mon May 20 10:30:00 2026

    Initial commit
```

**What this tells you:** The repository now has one permanent snapshot. The long
string after `commit` is a SHA-1 hash — a unique fingerprint of this exact snapshot.
No two commits in any repository anywhere have the same hash.

**Change something:** Run `git log --oneline`. You should see a shorter version:
`b2f7a89 Initial commit`. The `--oneline` flag is how you read a long history quickly.

---

### Concept: Commit Message Convention

**What it is:** A commit message is a short description of what changed and why,
following the imperative present-tense convention: "Add contacts list" not
"Added contacts list" or "Adding contacts list."

**The problem before:** Without a convention, commit histories look like:
```
"stuff"
"fixed it"
"more changes"
"asdf"
"working now"
"final"
"FINAL FINAL"
```
This is a log of *that you worked*, not *what changed*. When you need to find the
commit that introduced a specific bug, an unreadable history gives you nothing.

**The solution:** Imperative present tense reads like a command: "Add login page,"
"Fix null pointer in parser," "Remove deprecated endpoint." Reading a history of
imperative messages is like reading a list of actions the codebase can perform.

**Canonical example:** Git's own commit messages follow this convention. If you
look at the Linux kernel history: "Fix memory leak in TCP handler," not "Fixed"
or "Fixing." The imperative tense was chosen because it completes the sentence:
"If applied, this commit will... Fix memory leak in TCP handler."

**Smallest possible example:**
```bash
# Good commit messages:
git commit -m "Add contacts list"
git commit -m "Fix validation for empty email field"
git commit -m "Remove unused import in parser"

# Bad commit messages:
git commit -m "update"
git commit -m "fixed bug"
git commit -m "WIP"
```

**You will see this again in:** Every professional codebase, every open source
project, every code review. Reviewers notice bad commit messages immediately.

**Career signal:** This is a professional practice question. "How do you write
a commit message?" distinguishes a developer who has worked on a team from
one who has only worked alone.

**Watch for:** The first line of a commit message should be 50 characters or fewer.
If you need more, leave a blank line and write a longer description below.
Many tools truncate at 50 characters.

---

## Step 3 — Make Changes and See the Difference

Add Charlie to `contacts.txt`:

```
Alice, alice@example.com
Bob, bob@example.com
Charlie, charlie@example.com    ← add this line
```

Before staging, see exactly what changed:

```bash
git diff
```

Expected:

```diff
diff --git a/contacts.txt b/contacts.txt
index 3b18e51..7c8f3a2 100644
--- a/contacts.txt
+++ b/contacts.txt
@@ -1,2 +1,3 @@
 Alice, alice@example.com
 Bob, bob@example.com
+Charlie, charlie@example.com
```

Lines starting with `+` were added. Lines starting with `-` were removed.
Lines with no prefix are unchanged context.

Stage and commit:

```bash
git add contacts.txt
git commit -m "Add Charlie to contacts"
```

### SAVE AND TRY

```bash
git log --oneline
```

Expected:

```
e8c4d01 Add Charlie to contacts
b2f7a89 Initial commit
```

**What this tells you:** You now have two snapshots. The most recent is at the top.

**Change something:** Run `git show e8c4d01` (use your actual hash, not this one).
You should see the full diff of that commit — exactly what changed in that snapshot.

---

### Concept: `.gitignore` — Excluding Files from Version Control

**What it is:** A `.gitignore` file lists patterns of filenames that git should
never track, no matter what.

**The problem before:** Some files should never be committed:
- `node_modules/` — can be 500MB; anyone can recreate it from `package.json`
- `.env` — contains passwords and API keys; committing these is a security incident
- `__pycache__/` — Python bytecode; generated from source, not source itself
- `.DS_Store` — macOS metadata; meaningless to other developers

Without `.gitignore`, `git status` shows hundreds of irrelevant files, and a
careless `git add .` could commit secrets.

**The solution:** A `.gitignore` file at the root of the repository. Git reads it
and permanently ignores any file matching a listed pattern.

**What it hides:** `.gitignore` hides the noise. Without it, every `git status`
call returns a wall of generated files. With it, `git status` shows only files
that actually matter for the project.

The invariant: a file matching a `.gitignore` pattern can never be accidentally
staged. `git add .` simply skips it.

**Canonical example:**
```
# Generated code — anyone can recreate these
node_modules/
__pycache__/
*.pyc
dist/
build/

# Secrets — never commit these
.env
.env.local
*.pem
*.key

# Editor noise — meaningless to other developers
.DS_Store
.vscode/settings.json
*.swp
```

**Smallest possible example:**
```bash
echo "node_modules/" > .gitignore   # never track node_modules
echo ".env" >> .gitignore           # never track .env
git add .gitignore
git commit -m "Add gitignore"
```

**You will see this again in:** Every repository you ever create or clone.
GitHub provides `.gitignore` templates for every language and framework.

**Watch for:** A file that was already committed before being added to `.gitignore`
is still tracked. `.gitignore` only prevents future tracking. To stop tracking
an already-committed file: `git rm --cached filename`. This is how secrets get
leaked — they were committed before the `.gitignore` was set up.

---

## Step 4 — Create and Use a `.gitignore`

Create `.gitignore`:

```
.gitignore
```

```
# Temporary files — generated, not written by hand
*.tmp
*.bak

# Editor settings — specific to each developer's machine
.vscode/
```

Create a file that should be ignored:

```bash
echo "temporary data" > scratch.tmp
git status
```

Expected — `scratch.tmp` does not appear:

```
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore

nothing added to commit but untracked files present
```

Git ignored `scratch.tmp` because it matches the `*.tmp` pattern. Commit the
`.gitignore` itself:

```bash
git add .gitignore
git commit -m "Add gitignore for temp files and editor settings"
```

### SAVE AND TRY

```bash
git log --oneline
```

Expected:

```
a1b2c3d Add gitignore for temp files and editor settings
e8c4d01 Add Charlie to contacts
b2f7a89 Initial commit
```

**What this tells you:** The `.gitignore` is now part of the permanent history.
Any developer who clones this repository will automatically have the same ignore rules.

**Change something:** Add `*.txt` to `.gitignore`. Run `git status`. Does
`contacts.txt` disappear? It should not — files already tracked are unaffected
by `.gitignore`. Remove `*.txt` from `.gitignore` and confirm `contacts.txt`
reappears in `git status`.

---

## 🎯 Challenge: Document Why Each Line Is Ignored

**You know:** How `.gitignore` patterns work and why files should be excluded.

**Task:** Add three more entries to `.gitignore` — one for Python bytecode,
one for environment variables, and one for macOS metadata. Add a comment above
each explaining *why* that file type should never be committed.

**Starting code (current `.gitignore`):**

```
# Temporary files — generated, not written by hand
*.tmp
*.bak

# Editor settings — specific to each developer's machine
.vscode/
```

**Hint:** Python creates `__pycache__/` and `.pyc` files. Environment files are
usually named `.env`. macOS creates `.DS_Store` in every folder it opens.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```
# Temporary files — generated, not written by hand
*.tmp
*.bak

# Editor settings — specific to each developer's machine
.vscode/

# Python bytecode — generated from .py source files; not source code itself
__pycache__/
*.pyc

# Environment variables — contain passwords and API keys; never commit secrets
.env
.env.local

# macOS filesystem metadata — meaningless on Linux or Windows
.DS_Store
```

Then:

```bash
git add .gitignore
git commit -m "Expand gitignore for Python, env files, and macOS"
```

**Key insight:** Every line in `.gitignore` has a reason. Writing the reason
as a comment above each section means a new developer immediately understands
what they are looking at — and does not accidentally remove a line they do not
recognise.

</details>

---

### Concept: Branches — Parallel Versions of the Same Repository

**What it is:** A branch is an independent line of development — a diverging
version of the repository that you can work on without affecting the main version.

**The problem before:** Without branches, you have one version of the code.
To try something new, you either:
1. Change the main code and hope it works (risky — you might break something that worked)
2. Copy the entire project folder and work in the copy (error-prone — which copy is current?)

**The solution:** A branch creates a lightweight, isolated copy of the commit history.
You can switch between branches instantly. Changes on one branch do not affect another.
When you are happy with the work on a branch, you merge it back.

**What it hides:** Branches hide the cost of experimentation. Without branches,
trying something new has a real cost — it could break working code. With branches,
experimentation is free. The worst case is deleting the branch. The main code
is untouched.

The invariant: the `main` branch contains only what has been deliberately merged.
Nothing reaches `main` without going through a deliberate merge step.

**Canonical example:** A branch is like a parallel universe. The main universe
(the `main` branch) continues while you explore the alternate universe
(the feature branch). When your exploration succeeds, you merge the universes.
If it fails, you destroy the alternate universe and try again.

```
main:      A → B → C → D (merged from experiment)
                         ↑
experiment: A → B → X → Y
```

**Smallest possible example:**
```bash
git branch experiment         # create a branch called "experiment"
git checkout experiment       # switch to it (or: git switch experiment)
# ... make changes, commits ...
git checkout main             # switch back
git merge experiment          # bring experiment's changes into main
```

**You will see this again in:** Every team workflow. Feature branches, bugfix
branches, release branches — all the same concept. GitHub Pull Requests are
a way to review a branch before merging it to main.

**Career signal:** "What is your branching strategy?" is a standard interview
question for any team role. `git branch`, `git checkout`, and `git merge` are
table-stakes commands.

**Watch for:** You are always "on" exactly one branch. Run `git branch` with no
arguments to see which branch you are currently on — it is marked with `*`.
Running `git commit` always commits to the branch you are currently on.

---

## Step 5 — Create a Branch and Make Changes

Create a branch for an experimental change:

```bash
git branch experiment           # create the branch
git checkout experiment         # switch to it
```

Or in one step:

```bash
git checkout -b experiment      # create AND switch in one command
```

On the `experiment` branch, add David to `contacts.txt`:

```
Alice, alice@example.com
Bob, bob@example.com
Charlie, charlie@example.com
David, david@example.com        ← add this line
```

Commit it:

```bash
git add contacts.txt
git commit -m "Add David on experiment branch"
```

Now switch back to `main` and look at `contacts.txt`:

```bash
git checkout main
cat contacts.txt
```

### SAVE AND TRY

Expected — David is gone from `main`:

```
Alice, alice@example.com
Bob, bob@example.com
Charlie, charlie@example.com
```

**What this tells you:** Changes on `experiment` are invisible on `main`.
The two branches now have different histories. `main` has 4 commits.
`experiment` has 5.

**Change something:** Run `git log --oneline` on `main`. Then run
`git checkout experiment && git log --oneline`. You should see one extra commit
on `experiment`. Switch back to `main` with `git checkout main`.

---

## Step 6 — Create a Merge Conflict and Resolve It

A merge conflict occurs when two branches change the same part of the same file.
Understanding how to resolve conflicts is one of the most important git skills.

While still on `main`, change Alice's email:

```
Alice, alice-new@example.com    ← change this
Bob, bob@example.com
Charlie, charlie@example.com
```

Commit it:

```bash
git add contacts.txt
git commit -m "Update Alice email on main"
```

Now switch to `experiment` and change Alice's email to something different:

```bash
git checkout experiment
```

Edit `contacts.txt`:

```
Alice, alice-work@example.com   ← change this (different from main's change)
Bob, bob@example.com
Charlie, charlie@example.com
David, david@example.com
```

Commit it:

```bash
git add contacts.txt
git commit -m "Update Alice email on experiment"
```

Now merge `experiment` into `main`:

```bash
git checkout main
git merge experiment
```

### SAVE AND TRY

Expected — git reports a conflict:

```
Auto-merging contacts.txt
CONFLICT (content): Merge conflict in contacts.txt
Automatic merge failed; fix conflicts and then commit the result.
```

Open `contacts.txt`. It looks like this:

```
<<<<<<< HEAD
Alice, alice-new@example.com
=======
Alice, alice-work@example.com
>>>>>>> experiment
Bob, bob@example.com
Charlie, charlie@example.com
David, david@example.com
```

**Reading the conflict markers:**

- `<<<<<<< HEAD` — the start of the conflicting section; `HEAD` is the branch you are merging INTO (main)
- `=======` — the dividing line between the two versions
- `>>>>>>> experiment` — the end of the conflicting section; the branch being merged FROM

**Resolving:** Decide which version to keep. Delete the markers and keep what you want.
For example, keep the `main` version:

```
Alice, alice-new@example.com
Bob, bob@example.com
Charlie, charlie@example.com
David, david@example.com
```

Complete the merge:

```bash
git add contacts.txt
git commit -m "Merge experiment: keep main email for Alice"
```

**What this tells you:** Conflicts are not errors — they are git asking you to
make a decision it cannot make automatically. Every developer encounters conflicts.
Knowing how to read and resolve them confidently is what separates confident git
users from nervous ones.

**Change something:** Run `git log --oneline`. You should see all commits from
both branches, plus the merge commit at the top.

---

## 🎯 Challenge: Simulate a Real Development Workflow

**You know:** How to create branches, commit, merge, and resolve conflicts.

**Task:** Simulate a two-feature workflow:

1. On `main`, make the contacts file the starting point
2. Create a branch called `feature/add-phone` and add a phone field to every contact
   (format: `Name, email, phone`)
3. Switch back to `main` and create a branch called `feature/sort-alphabetically`
   that reorders the contacts alphabetically
4. Merge `feature/add-phone` into `main` first
5. Then merge `feature/sort-alphabetically` into `main` — this will create a conflict
   since both branches modified every line
6. Resolve the conflict so the final file has contacts sorted alphabetically AND
   with phone numbers

**Requirements checklist:**
- [ ] Two separate feature branches with separate commits
- [ ] Both branches merged into `main`
- [ ] Conflict resolved with all data present (no lost lines)
- [ ] `git log --oneline` shows at least 6 commits

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```bash
# Start on main with clean contacts.txt (Alice, Bob, Charlie, David)
git checkout -b feature/add-phone

# Edit contacts.txt to add phone numbers:
# Alice, alice-new@example.com, 555-0101
# Bob, bob@example.com, 555-0102
# Charlie, charlie@example.com, 555-0103
# David, david@example.com, 555-0104

git add contacts.txt
git commit -m "Add phone numbers to all contacts"
git checkout main

git checkout -b feature/sort-alphabetically
# Edit contacts.txt to sort A-Z (Alice, Bob, Charlie, David is already sorted)
# Add Eve to make the sort meaningful:
# Alice, alice-new@example.com
# Bob, bob@example.com
# Charlie, charlie@example.com
# David, david@example.com
# Eve, eve@example.com
git add contacts.txt
git commit -m "Add Eve and ensure alphabetical order"
git checkout main

git merge feature/add-phone           # merges cleanly
git merge feature/sort-alphabetically # conflict on every line

# Resolve: keep the sorted order AND keep phone numbers
# Alice, alice-new@example.com, 555-0101
# Bob, bob@example.com, 555-0102
# Charlie, charlie@example.com, 555-0103
# David, david@example.com, 555-0104
# Eve, eve@example.com

git add contacts.txt
git commit -m "Merge sort branch: combine sort order with phone numbers"
```

**Key insight:** Merge conflicts on many lines are resolved the same way as
single-line conflicts — read both versions, decide what the final result should be,
write it, and remove the markers. The conflict markers never change the file's
content; they only mark the boundaries of the decision you need to make.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Repository exists | `git log --oneline` | At least 5 commits visible |
| `.gitignore` works | `echo "x" > test.tmp && git status` | `test.tmp` not listed; delete it after |
| Branch exists | `git branch` | `experiment` listed |
| Currently on main | `git branch` | `* main` shown |
| Conflict resolved | `cat contacts.txt` | No `<<<<<<<` markers; all contacts present |
| All commits readable | `git log --oneline` | All messages use imperative present tense |

---

## Quick Check Answers

**1. You have been editing for two hours. Without git, how do you get back to
this morning's version?**

Without git, you cannot. If you did not manually copy the file before starting,
the previous version is gone. Some editors have undo history, but it does not
survive closing the editor, and it does not help if the file was saved and
reopened. This is exactly why git exists — every `git commit` is a named,
permanent point you can return to with `git checkout <commit-hash>`.

**2. You both change the same file. What happens when you try to combine your work?**

Git attempts to merge the changes automatically. If you changed different lines,
git can usually merge them without your intervention. If you both changed the
same lines (or nearby lines), git creates a conflict — it marks the conflicting
sections with `<<<<<<<`, `=======`, and `>>>>>>>` and waits for you to decide
which version to keep. The merge is not complete until you resolve all conflicts
and commit.

**3. What is the difference between `git add` and `git commit`?**

`git add` moves a change from the working directory (your files on disk) to the
staging area (a holding area for the next commit). Nothing is permanently saved yet.
`git commit` takes everything in the staging area and writes it as a permanent
snapshot to the repository. The staging area lets you be selective — you can
`git add` three of five changed files and commit only those three, leaving the
other two for a separate commit with a different message.
