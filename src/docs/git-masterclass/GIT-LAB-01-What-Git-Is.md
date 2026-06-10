# Git Masterclass — LAB 01 — What Git Is

**This is the first lab.** No prior Git knowledge assumed.

**What this lab covers:**
- What version control is and the problem it solves
- What Git specifically is (and what it is not)
- The mental model you need before any command makes sense
- Your first four Git commands: `init`, `status`, `add`, `commit`
- Reading history with `log`

---

## What You Will Build

By the end of this lab you will have a real Git repository on your machine.
It will contain a text file with two saved snapshots of its history.

In your terminal you will be able to run:

```bash
git log --oneline
```

And see output like this:

```
b3f9a12 Add project description
a1c4e88 First commit: create notes file
```

Two lines. Two saved moments in time. Both recoverable forever.
That is what this lab builds.

---

## Concept: Version Control

**What it is:** A system that records changes to files over time so you can
recall any specific version later.

**The problem before:**
You write code. It works. You change it. It breaks. You try to undo the
change but you already saved over the working version. The only option is
to rewrite the working code from memory — if you can remember it.

Or you use a workaround like this:

```
project/
  main.js
  main_backup.js
  main_backup_final.js
  main_backup_final_ACTUALLY_FINAL.js
  main_working_DO_NOT_DELETE.js
```

This is manual version control. It works until you have 40 files and six
backups each and you cannot remember which `_final` is actually final.

**The solution:** A version control system does the bookkeeping for you.
Every time you decide "this is a good state," you tell the system to
record it. The system stores that snapshot permanently. You can always
go back to any snapshot you ever saved.

**Why it matters here:** Every Git command in this series is a tool for
managing these saved snapshots. Understanding that Git is a snapshot
manager — not a magic undo button — is the mental model that makes
every command make sense.

**Watch for:** Version control only saves what you explicitly tell it to
save. If you never record a snapshot, there is nothing to recover.
Git cannot help you if you never committed.

---

## Concept: What Git Is (and What It Is Not)

**What it is:** Git is a version control system that runs entirely on your
local machine. It is a program that tracks snapshots of your files over time.

**What Git is NOT:**
- Git is not GitHub. GitHub is a website that hosts Git repositories online.
  Git works without GitHub. GitHub works because Git exists.
- Git is not a backup system. It records what you tell it to record.
  It does not automatically save anything.
- Git is not only for code. It works on any text files: Markdown, HTML,
  config files, lesson content like this series.

**The distinction that matters:**
```
Git  = the tool on your computer that manages snapshots
GitHub = a website where you can upload those snapshots for sharing/backup
```

You will not touch GitHub until LAB-04. For LAB-01 through LAB-03,
everything stays on your machine.

**Watch for:** When someone says "push to Git" they almost certainly mean
"push to GitHub." The word Git is used loosely. In this series, Git means
the local program and GitHub means the website. The difference matters.

---

## Concept: The Repository

**What it is:** A repository (repo for short) is a directory that Git is
tracking. It contains your files AND a hidden folder called `.git` that
stores the entire history of every snapshot you have ever saved.

**The problem before:** Your files and your history are separate things
stored in different places (or not stored at all).

**The solution:** `git init` turns any directory into a repository by
creating the `.git` folder inside it. From that moment, Git can track
any file in that directory that you tell it to.

**Example — what a repository looks like:**
```
my-project/          ← your project directory
  .git/              ← Git's private storage (do not touch this)
    HEAD
    objects/
    refs/
  notes.txt          ← your actual file
```

**Why it matters here:** The first command you run in every new project
is `git init`. It is always the starting point.

**Watch for:** The `.git` folder is hidden (its name starts with a dot).
Your file explorer may not show it. That is normal. Do not delete it —
deleting `.git` destroys all of your history.

---

## Concept: The Snapshot Model

**What it is:** Git stores your project's history as a series of
**snapshots** — complete pictures of what every tracked file looked like
at the moment you saved.

**The common misconception:** Many people assume Git stores "diffs" —
lists of what changed between versions. Git actually stores snapshots.
(It compresses them efficiently, but the mental model is snapshots.)

**Why this matters:**

```
Timeline of snapshots:

Snapshot A          Snapshot B          Snapshot C
──────────          ──────────          ──────────
notes.txt v1  →     notes.txt v2  →     notes.txt v3
                    ideas.txt v1  →     ideas.txt v2
```

Each snapshot is a complete, independent picture. To go back to Snapshot A,
Git does not "undo" anything — it simply shows you the Snapshot A picture.
This is why recovery is reliable: there is nothing to "compute," just
a picture to retrieve.

**Watch for:** Git only has a snapshot if you told it to take one.
Unsaved work (work not committed) is not in any snapshot and cannot be
recovered by Git.

---

## Concept: `git init`

**What it is:** The command that creates a new Git repository in the
current directory. It creates the `.git` folder and sets up Git's
internal storage.

**Syntax:**
```bash
git init
```

Run this once per project. You do not run it again after the first time.

**Example output:**
```
Initialized empty Git repository in /Users/you/my-project/.git/
```

**Why it matters here:** This is always Step 1. No other Git command
works in a directory until `git init` has been run there.

**Watch for:** If you run `git init` inside a folder that is already
inside another Git repository, you create a "nested" repository. This
causes confusing problems. Always check you are in the right folder
before running `git init`.

---

## Step 1 — Create a Project Folder and Initialize Git

Open your terminal. Create a fresh folder to practice in:

```bash
mkdir git-practice
cd git-practice
```

Now initialize a Git repository:

```bash
git init
```

You should see:

```
Initialized empty Git repository in /path/to/git-practice/.git/
```

### SAVE AND TRY

You are already in the terminal, so "save" here means: confirm the result.

Run:
```bash
ls -la
```

You should see a `.git` directory listed. It will look something like:

```
drwxr-xr-x   .
drwxr-xr-x   ..
drwxr-xr-x   .git
```

The `.git` directory is proof that this folder is now a Git repository.

In the terminal, also run:
```bash
ls .git
```

Expected: you will see folders like `HEAD`, `objects`, `refs`. These are
Git's internal files. You will never edit these directly.

**Change something:** Run `git init` in the same folder again.
Expected: Git says `Reinitialized existing Git repository`. It does not
erase history — re-initializing is safe and idempotent.

---

## Concept: `git status`

**What it is:** The most important Git command for understanding what is
happening right now. It shows:
- Which files Git knows about
- Which files have changed since the last snapshot
- Which files are ready to be saved into the next snapshot

**Syntax:**
```bash
git status
```

You can run this as many times as you want. It never changes anything —
it only reports the current state.

**Example output (nothing committed yet, no files):**
```
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

**Example output (a file exists but Git has not been told about it):**
```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
    notes.txt

nothing added to commit but untracked files present (use "git add" to track)
```

**Why it matters here:** `git status` is your compass. Any time you are
unsure what state your repository is in, run `git status`. Every section
of its output tells you exactly what to do next.

**Watch for:** "Untracked files" means Git can see the file exists but
is not managing it yet. An untracked file is NOT protected. It must be
added before Git will save it.

---

## Step 2 — Create a File and Check Status

Create a file in your `git-practice` folder:

```bash
echo "This is my Git practice project." > notes.txt
```

This creates a file called `notes.txt` with one line of text.

Now run:

```bash
git status
```

### SAVE AND TRY

You should see:

```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt

nothing added to commit but untracked files present (use "git add" to track)
```

Key things to notice:
- `notes.txt` appears under **Untracked files**. Git sees it but is not
  tracking it.
- Git even tells you what to do: `use "git add <file>..."`.

**In your terminal, try:**
```bash
git status
```
Expected: same output as above. `git status` is always safe to run.

**Change something:** Create a second file:
```bash
echo "Second file." > ideas.txt
git status
```
Expected: both `notes.txt` and `ideas.txt` appear under Untracked files.
Delete `ideas.txt` for now — we will keep this lab focused:
```bash
rm ideas.txt
```

---

## Concept: The Two-Step Save: Stage Then Commit

**What it is:** In Git, saving a snapshot is always a two-step process:

1. **Stage** — tell Git which files (or which changes) to include in the
   next snapshot. This is done with `git add`.
2. **Commit** — save the staged changes as a permanent snapshot.
   This is done with `git commit`.

**Why two steps?** This is the question every beginner asks.

Imagine you have changed ten files. Some are finished. Some are mid-thought.
You want to save only the five finished ones as one snapshot. The staging
step lets you select exactly which changes go into the next snapshot.

**The problem without staging:**
Every save would include everything changed, mixed together.
You could not save "just the feature I finished" without also saving
"the unfinished experiment I was trying."

**The solution:**
```
Working Directory     Staging Area        Repository
(files on disk)  →   (selected           (saved snapshots)
                       changes)
                 add →              commit →
```

`git add` moves changes from the working directory into the staging area.
`git commit` saves everything in the staging area as one new snapshot.

**Why it matters here:** Every time you save work in Git, you will
run `git add` then `git commit`. This is the core rhythm of all Git work.

**Watch for:** A file that is changed but NOT staged will not appear in
the next commit. This is a common source of "why isn't my change saved?"
Always check `git status` before committing to see what is actually staged.

---

## Concept: `git add`

**What it is:** The command that stages changes — moving files (or parts
of files) from the working directory into the staging area, ready to be
included in the next commit.

**Syntax:**
```bash
git add filename.txt         # stage one specific file
git add .                    # stage ALL changed files in this directory
git add folder/              # stage all changed files in a folder
```

**Example:**
```bash
git add notes.txt
```

After running this, `notes.txt` moves from "Untracked" to "Changes to be
committed" when you run `git status`.

**Why it matters here:** Without `git add`, `git commit` has nothing to
save. You must stage before you can commit.

**Watch for:** `git add .` (with a dot) stages everything. This is
convenient but can accidentally stage files you did not mean to include.
When in doubt, stage files by name.

---

## Step 3 — Stage the File

Stage `notes.txt`:

```bash
git add notes.txt
```

Then check the status:

```bash
git status
```

### SAVE AND TRY

You should see:

```
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   notes.txt
```

Key change: `notes.txt` has moved from **Untracked files** to
**Changes to be committed**. It is now staged — ready to be saved
in the next snapshot.

**In your terminal, type:**
```bash
git status
```
Expected: `notes.txt` listed under "Changes to be committed" in green
(most terminals color this green).

**Change something:** Create `ideas.txt` again and add both files:
```bash
echo "Ideas go here." > ideas.txt
git add .
git status
```
Expected: both files listed under "Changes to be committed."
Then clean up — unstage `ideas.txt` and remove it:
```bash
git rm --cached ideas.txt
rm ideas.txt
git status
```
Expected: back to just `notes.txt` staged.

---

## Concept: `git commit`

**What it is:** The command that saves everything in the staging area as
a permanent, named snapshot in the repository's history.

**Syntax:**
```bash
git commit -m "Your message here"
```

The `-m` flag lets you provide a **commit message** directly in the command.
A commit message describes what this snapshot contains and why it was saved.

**What makes a good commit message:**
- Start with a verb: "Add", "Fix", "Update", "Remove"
- Describe what the snapshot contains, not what you did: "Add project notes file"
  not "I added the notes file"
- Be specific enough that future-you understands it in six months

**Examples:**
```bash
git commit -m "Add project notes file"         # ✓ good
git commit -m "stuff"                          # ✗ useless
git commit -m "Fixed the thing"                # ✗ what thing?
git commit -m "Update notes with project goals"  # ✓ good
```

**What a commit produces:**
Git saves the snapshot and assigns it a **commit hash** — a unique 40-character
identifier like `b3f9a12c4e8...`. This hash is how Git identifies every
snapshot ever saved. You will use shortened versions of these hashes frequently.

**Why it matters here:** The commit is the actual save. Everything before
this point was preparation. After this command runs, the snapshot is permanent.

**Watch for:** Git requires your name and email before you can commit.
If you have never configured Git, it will refuse and ask you to run:
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```
Run these once. Git remembers them for all future commits.

---

## Step 4 — Configure Git (First Time Only)

Before your first commit, tell Git who you are. This information is
recorded in every commit you make.

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

Replace `Your Name` with your actual name and `your@email.com` with your
email. These are stored in a file at `~/.gitconfig` and apply to every
Git repository on your machine.

Verify it saved:
```bash
git config --global user.name
git config --global user.email
```

Expected: your name and email printed back.

---

## Step 5 — Make Your First Commit

Stage is already done (from Step 3). Now commit:

```bash
git commit -m "First commit: create notes file"
```

### SAVE AND TRY

You should see output like:

```
[main (root-commit) a1c4e88] First commit: create notes file
 1 file changed, 1 insertion(+)
 create mode 100644 notes.txt
```

Breaking down this output:
- `main` — the branch name (covered in LAB-03)
- `(root-commit)` — this is the very first commit in this repository
- `a1c4e88` — the shortened commit hash (yours will be different)
- `First commit: create notes file` — your message
- `1 file changed, 1 insertion(+)` — what changed

Now run `git status`:

```
On branch main
nothing to commit, working tree clean
```

"Nothing to commit, working tree clean" is the happy state. It means
everything on disk matches the last snapshot.

**In your terminal, type:**
```bash
git status
```
Expected: `nothing to commit, working tree clean`.

**Change something:** Open `notes.txt`, add a second line, save it,
then run `git status` again. Expected: Git now shows `notes.txt` as
"modified" — you have changed it since the last commit. We will use
this in the next step.

---

## Concept: `git log`

**What it is:** The command that shows the history of all commits in the
repository, from newest to oldest.

**Syntax:**
```bash
git log              # full history with all details
git log --oneline    # one line per commit (compact view)
```

**Example output of `git log`:**
```
commit a1c4e882f3d1b5a09c2e87f4b6d3c1e9a5f2b8d7
Author: Your Name <you@email.com>
Date:   Fri May 2 14:30:00 2025 -0400

    First commit: create notes file
```

**Example output of `git log --oneline`:**
```
a1c4e88 First commit: create notes file
```

Each line is one commit. The short hash on the left (`a1c4e88`) is the
first 7 characters of the full 40-character hash. It is unique enough
to identify the commit in any future command.

**Why it matters here:** `git log` is how you read your project's history.
Every commit you ever save will appear here. It is the record of all
snapshots ever taken.

**Watch for:** `git log` opens in a **pager** (usually `less`) when
there are many commits. Press `q` to quit. Use `git log --oneline`
to avoid the pager for short histories.

---

## Step 6 — Make a Second Commit and Read History

Add a second line to `notes.txt`. If you already did this in the previous
SAVE AND TRY, your file is already modified. If not:

```bash
echo "Goal: learn Git from first principles." >> notes.txt
```

The `>>` operator appends to the file without overwriting it.

Check status:
```bash
git status
```

Expected:
```
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   notes.txt
```

"Modified" means the file has changed since the last commit. Stage and commit:

```bash
git add notes.txt
git commit -m "Add project description"
```

Now read the history:

```bash
git log --oneline
```

### SAVE AND TRY

You should see two commits:

```
b3f9a12 Add project description
a1c4e88 First commit: create notes file
```

(Your hashes will be different — every commit hash is unique.)

Newest commit is at the top. Oldest is at the bottom.

**In your terminal, type:**
```bash
git log --oneline
```
Expected: exactly two lines, newest first.

**Change something:** Run `git log` (without `--oneline`):
```bash
git log
```
Expected: full details for both commits including author, date, and full message.
Press `q` to exit if it opens a pager.

---

## Concept: The Commit Hash

**What it is:** A 40-character identifier generated by hashing the
contents of a commit. Every commit has a unique hash. No two commits
anywhere in the world have the same hash.

**Example:**
```
a1c4e882f3d1b5a09c2e87f4b6d3c1e9a5f2b8d7
```

The shortened 7-character version (`a1c4e88`) is used in most commands.
Git can identify a commit from just the first few characters as long as
they are unique in your repository.

**Why it matters here:** You will use commit hashes in LAB-05 (Fixing
Mistakes) to go back to specific snapshots. For now, just know that every
commit has a unique address.

**Watch for:** Your hashes will be different from any example in this
series. That is correct. Hashes are generated from the commit content
and the time it was made — they are always unique.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Git repository created | Run `ls -la` in `git-practice/`. See `.git/` directory. |
| Git identity configured | Run `git config --global user.name`. See your name printed. |
| File staged | Run `git status`. See `notes.txt` under "Changes to be committed." |
| First commit saved | Run `git log --oneline`. See at least one line. |
| Second commit saved | Run `git log --oneline`. See two lines. |
| Clean working tree | Run `git status`. See "nothing to commit, working tree clean." |

---

## What You Learned

| Concept | What it means |
|---------|---------------|
| Repository | A directory that Git is tracking — contains your files and `.git/` |
| Snapshot | A permanent record of what all tracked files looked like at one moment |
| Staging area | A holding area for changes you are about to commit |
| `git init` | Creates a new repository in the current directory |
| `git status` | Shows what is tracked, changed, staged, and committed |
| `git add` | Moves changes from working directory into the staging area |
| `git commit -m` | Saves staged changes as a permanent snapshot with a message |
| `git log --oneline` | Shows the list of all commits, one per line |
| Commit hash | The unique address of every commit |

---

## Up Next

**[LAB-02 — The Three Zones](./GIT-LAB-02-Three-Zones.md)**

You have used the three zones (working directory, staging area, repository)
without naming them precisely. LAB-02 names them, draws the full picture,
and teaches you to see exactly where any change lives at any moment.
It also teaches `git diff` — how to see exactly what changed in a file
before committing it.
