# Git Masterclass — LAB 02 — The Three Zones

**Read [LAB-01](./GIT-LAB-01-What-Git-Is.md) first.** That lab introduced
`init`, `add`, `commit`, `status`, and `log`. This lab explains the model
that makes all of those commands coherent.

**What this lab adds over LAB-01:**
- The official names and precise definitions of the three zones
- How to see exactly what changed in a file before staging it (`git diff`)
- How to see what is staged before committing it (`git diff --staged`)
- How to read a diff (the `+` and `-` lines)
- How to view a past commit in detail (`git show`)
- How to unstage something you staged by accident (`git restore --staged`)

---

## What You Will Build

By the end of this lab you will be able to answer three questions at any
moment with a single command each:

1. **"What have I changed that is NOT staged yet?"** → `git diff`
2. **"What have I staged that will go into my next commit?"** → `git diff --staged`
3. **"What exactly did commit X contain?"** → `git show <hash>`

You will also understand why files sometimes seem to "disappear" from staging
when you keep editing — and how to prevent that confusion.

---

## Concept: The Three Zones

**What it is:** Every file in a Git repository exists in one of three places
at any given time. Understanding which zone a file is in explains every
Git command.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ZONE 1                ZONE 2                ZONE 3           │
│   Working Directory  →  Staging Area     →   Repository        │
│   (files on disk)       (the draft)          (saved history)   │
│                                                                 │
│   You edit files here.  git add puts       git commit saves    │
│                         changes here.      staged changes      │
│                                            permanently.        │
│                                                                 │
│                  ← git restore              ← git restore      │
│                    (unstage)                  --staged         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Zone 1 — Working Directory:**
The actual files on your disk. When you open a file in your editor and
type, you are changing the working directory. Git can see that these
files have changed (it compares them to the last commit), but it has
not done anything with the changes yet.

**Zone 2 — Staging Area (also called the Index):**
A holding area that contains exactly what will go into the next commit.
When you run `git add`, you are promoting changes from the working
directory into the staging area. Nothing in the staging area is permanent
yet — you can still change your mind.

**Zone 3 — Repository:**
The permanent record of every commit ever made. When you run `git commit`,
everything in the staging area gets saved here permanently. The repository
lives inside the `.git` folder.

**Why it matters here:** Every `git status` message makes more sense
once you know the three zones. "Changes not staged" = Zone 1.
"Changes to be committed" = Zone 2. "nothing to commit" = Zone 3 matches Zone 1.

**Watch for:** A file can exist in all three zones simultaneously with
different contents. You can stage a change, then keep editing the file.
Zone 1 (disk) has the newest version. Zone 2 (staging) has the version
you staged. Zone 3 (repository) has the last committed version. All three
can be different.

---

## Step 1 — Set Up: Continue from LAB-01

Navigate to your `git-practice` folder from LAB-01:

```bash
cd git-practice
git log --oneline
```

Expected: two commits from LAB-01.

If you do not have the LAB-01 folder, create it fresh:

```bash
mkdir git-practice
cd git-practice
git init
git config --global user.name "Your Name"
git config --global user.email "you@email.com"
echo "This is my Git practice project." > notes.txt
git add notes.txt
git commit -m "First commit: create notes file"
echo "Goal: learn Git from first principles." >> notes.txt
git add notes.txt
git commit -m "Add project description"
```

### SAVE AND TRY

Run:
```bash
git status
git log --oneline
```

Expected:
```
On branch main
nothing to commit, working tree clean
```
```
b3f9a12 Add project description
a1c4e88 First commit: create notes file
```

Your working directory is clean. Zone 1 and Zone 3 match exactly.

---

## Concept: `git diff` — Comparing Zone 1 to Zone 3

**What it is:** `git diff` (with no arguments) shows the difference
between what is on disk (Zone 1, working directory) and the last commit
(Zone 3, repository). It answers: "What have I changed that I have NOT
staged yet?"

**Syntax:**
```bash
git diff                  # Zone 1 vs Zone 3 (unstaged changes)
git diff --staged         # Zone 2 vs Zone 3 (staged changes)
```

**How to read a diff:**

```diff
diff --git a/notes.txt b/notes.txt
index a1b2c3d..e4f5g6h 100644
--- a/notes.txt
+++ b/notes.txt
@@ -1,2 +1,3 @@
 This is my Git practice project.
 Goal: learn Git from first principles.
+This line was added.
```

Breaking it down:
- `--- a/notes.txt` — the "before" version (Zone 3, last commit)
- `+++ b/notes.txt` — the "after" version (Zone 1, current disk)
- `@@ -1,2 +1,3 @@` — location indicator: before had 2 lines starting at line 1,
  after has 3 lines starting at line 1
- Lines with a space ` ` — unchanged context lines
- Lines with `+` — lines that were added
- Lines with `-` — lines that were removed

**Why it matters here:** Before committing, always run `git diff` to confirm
you are saving exactly what you intended. Never commit blindly.

**Watch for:** `git diff` shows nothing if no files have been changed, OR
if all changes are already staged. "Nothing shown" does not mean
"nothing changed" — the changes may all be in Zone 2.

---

## Step 2 — Make a Change and Read the Diff

Add a new line to `notes.txt`:

```bash
echo "Status: learning the three zones." >> notes.txt
```

Now check the diff:

```bash
git diff
```

### SAVE AND TRY

You should see output like:

```diff
diff --git a/notes.txt b/notes.txt
index 4b5e6f7..8c9d0e1 100644
--- a/notes.txt
+++ b/notes.txt
@@ -1,2 +1,3 @@
 This is my Git practice project.
 Goal: learn Git from first principles.
+Status: learning the three zones.
```

The `+` line is the new content you added. The two lines without a prefix
are unchanged context.

**In your terminal, type:**
```bash
git status
```
Expected: `notes.txt` listed under "Changes not staged for commit."
The change lives in Zone 1 (disk) only.

**Change something:** Open `notes.txt` in a text editor and manually
add another line, save, then run `git diff` again. Expected: both new
lines appear with `+`. The diff always shows the full difference from
the last commit — not just the most recent edit.

---

## Concept: `git diff --staged` — Comparing Zone 2 to Zone 3

**What it is:** Shows the difference between what is staged (Zone 2,
staging area) and the last commit (Zone 3, repository). It answers:
"What will actually go into my next commit?"

**Why this is different from `git diff`:**

```
git diff           = Zone 1 vs Zone 3  (what is NOT staged yet)
git diff --staged  = Zone 2 vs Zone 3  (what IS staged — the next commit)
```

If you stage a change and then keep editing the same file, the two
commands show different things. `git diff` shows the new unstaged changes.
`git diff --staged` shows what is committed if you commit right now.

**Why it matters here:** This is your final check before committing.
Run `git diff --staged` to see exactly what you are about to save.
It prevents "oops, I committed the wrong thing" mistakes.

**Watch for:** If you have not staged anything, `git diff --staged`
shows nothing — because Zone 2 is empty. This is correct behavior.

---

## Step 3 — Stage the Change and Compare Both Diffs

Stage the change from Step 2:

```bash
git add notes.txt
```

Now run both diff commands:

```bash
git diff
git diff --staged
```

### SAVE AND TRY

After `git add notes.txt`:

`git diff` should show **nothing** — because all changes are now in Zone 2.
There is no difference between Zone 1 (disk) and Zone 2 (staging);
they match. And `git diff` compares Zone 1 to Zone 3, showing what is
unstaged — which is now zero.

`git diff --staged` should show:

```diff
diff --git a/notes.txt b/notes.txt
index 4b5e6f7..8c9d0e1 100644
--- a/notes.txt
+++ b/notes.txt
@@ -1,2 +1,3 @@
 This is my Git practice project.
 Goal: learn Git from first principles.
+Status: learning the three zones.
```

This is exactly what will be saved if you commit right now.

**In your terminal, type:**
```bash
git status
```
Expected: `notes.txt` under "Changes to be committed." It is in Zone 2.

**Change something:** Edit `notes.txt` again in a text editor — add
one more line and save. Then run both diffs. Expected: `git diff` shows
the NEW line (Zone 1 vs Zone 3). `git diff --staged` still shows the
PREVIOUS line (Zone 2 vs Zone 3). This demonstrates that all three zones
can have different content simultaneously.

---

## Concept: The Zone Split Problem

**What it is:** The situation where Zone 1 (disk) and Zone 2 (staging)
contain different versions of the same file because you staged a change
and then kept editing.

**Example:**
```
notes.txt in Zone 3 (last commit):   2 lines
notes.txt in Zone 2 (staging):       3 lines (you staged 1 new line)
notes.txt in Zone 1 (disk):          4 lines (you added another line after staging)
```

If you commit right now, the commit will contain 3 lines — the Zone 2
version. The 4th line (Zone 1) will NOT be in the commit.

**Why this trips people up:** After `git add`, you may assume "Git has
my latest changes." But Git staged the file as it was at the moment of
`git add`. Any edits made after `git add` are in Zone 1 only.

**The solution:** Run `git status` and `git diff --staged` before every
commit. If Zone 1 and Zone 2 differ, you will see "Changes not staged
for commit" AND "Changes to be committed" both listed at the same time.

**Why it matters here:** You will encounter this regularly. The fix is
always the same: run `git add` again to re-stage the latest version of
the file, then commit.

---

## Step 4 — Commit and Verify the Log

First, make sure only the line from Step 2 is staged (re-stage if needed):

```bash
git add notes.txt
git diff --staged
```

Confirm only the "Status: learning the three zones." line appears.
Then commit:

```bash
git commit -m "Add status line to notes"
```

### SAVE AND TRY

Run:
```bash
git log --oneline
```

Expected: three commits now:
```
c7d8e9f Add status line to notes
b3f9a12 Add project description
a1c4e88 First commit: create notes file
```

Run:
```bash
git status
```
Expected: `nothing to commit, working tree clean`

**In your terminal, type:**
```bash
git diff
git diff --staged
```
Expected: both show nothing. All three zones match.

---

## Concept: `git show` — Inspecting a Past Commit

**What it is:** Shows the full details of a specific commit: who made it,
when, the message, and the complete diff of what changed.

**Syntax:**
```bash
git show              # shows the most recent commit
git show a1c4e88     # shows a specific commit by hash
git show HEAD        # HEAD is a pointer to the current commit (same as most recent)
```

**What HEAD is:**
`HEAD` is a special pointer that always points to the commit you are
currently "at" — usually the most recent commit on your current branch.
Think of it as "where you are right now" in the history.

**Example output:**
```
commit c7d8e9f...
Author: Your Name <you@email.com>
Date:   Fri May 2 15:00:00 2025 -0400

    Add status line to notes

diff --git a/notes.txt b/notes.txt
--- a/notes.txt
+++ b/notes.txt
@@ -1,2 +1,3 @@
 This is my Git practice project.
 Goal: learn Git from first principles.
+Status: learning the three zones.
```

**Why it matters here:** `git show` lets you inspect what any past
snapshot contained. You will use this when debugging to understand
exactly what changed and when.

**Watch for:** `git show` opens in a pager for large diffs. Press `q`
to exit.

---

## Step 5 — Inspect Past Commits

Run `git log --oneline` to see your commit hashes:

```bash
git log --oneline
```

Copy the hash of your very first commit (the bottom one). Then:

```bash
git show <your-first-commit-hash>
```

For example:
```bash
git show a1c4e88
```

### SAVE AND TRY

You should see the details of your first commit. The diff will show
`notes.txt` being added for the first time — every line with a `+` prefix
because the file did not exist before this commit.

**In your terminal, type:**
```bash
git show HEAD
```
Expected: the most recent commit (your third commit). Same as `git show`
with no argument.

**Change something:** Run `git show HEAD~1` — the tilde-one means
"one commit before HEAD."
Expected: your second commit. `HEAD~2` would show your first commit.
`HEAD~N` means "N commits back from current."

---

## Concept: `git restore --staged` — Unstaging a File

**What it is:** Removes a file from the staging area (Zone 2) without
touching the file on disk (Zone 1). The change is still there — it just
moves back to "not staged."

**Syntax:**
```bash
git restore --staged filename.txt    # unstage one file
git restore --staged .               # unstage everything
```

**The problem before:**
You `git add .` to quickly stage everything, then realize one file has
debug logging or an unfinished feature you do not want in the commit.
How do you remove just that file from staging without losing your changes?

**The solution:**
```bash
git restore --staged the-file-i-dont-want.txt
```

The file stays changed on disk (Zone 1). It just leaves the staging area (Zone 2).

**Why it matters here:** Mistakes happen. This command is how you undo
a `git add` without losing any work.

**Watch for:** `git restore --staged` does NOT change the file on disk.
It only moves it from Zone 2 back to Zone 1. Your changes are safe.
This is different from `git restore` (without `--staged`), which discards
the Zone 1 changes entirely. Be careful with that one — covered in LAB-05.

---

## Step 6 — Practice Staging and Unstaging

Create a new file alongside `notes.txt`:

```bash
echo "Draft ideas — not ready." > draft.txt
```

Stage both files:

```bash
git add .
git status
```

Expected: both `notes.txt` (if you edited it) and `draft.txt` listed
under "Changes to be committed."

Wait — `draft.txt` is not ready. Unstage it:

```bash
git restore --staged draft.txt
git status
```

### SAVE AND TRY

You should see:

```
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
    (nothing here — or notes.txt if you edited it)

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	draft.txt
```

`draft.txt` is back to "Untracked" — it was never committed, so unstaging
sends it back to untracked. The file still exists on disk.

**In your terminal, type:**
```bash
cat draft.txt
```
Expected: `Draft ideas — not ready.` — the file is intact on disk.

**Change something:** Run `git add draft.txt` again, then `git status`.
Expected: it is staged again. Then `git restore --staged draft.txt`.
Expected: back to untracked. Staging and unstaging are reversible and safe.

Clean up — delete the draft file for now:
```bash
rm draft.txt
```

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Three zones understood | Run `git status`. Identify which zone each listed file is in. |
| Unstaged diff readable | Make a change, run `git diff`. See the `+` lines. |
| Staged diff readable | Stage a change, run `git diff --staged`. See what will be committed. |
| Zone split observed | Stage, then edit, then run both diffs. See they differ. |
| Past commit inspected | Run `git show <hash>`. See the diff for that commit. |
| HEAD understood | Run `git show HEAD`. See the most recent commit. |
| Unstage without losing work | Run `git restore --staged file.txt`. File remains on disk unchanged. |

---

## The Three Zones — Quick Reference

```
QUESTION                           COMMAND
────────────────────────────────   ──────────────────────
What changed and is NOT staged?    git diff
What is staged for next commit?    git diff --staged
What zone is everything in?        git status
What did commit X look like?       git show <hash>
Move a change from Z1 to Z2       git add <file>
Move a change from Z2 to Z1       git restore --staged <file>
Save Z2 permanently into Z3       git commit -m "message"
```

---

## What You Learned

| Concept | What it means |
|---------|---------------|
| Zone 1 — Working Directory | Files on disk. Changed by editing. |
| Zone 2 — Staging Area / Index | Changes selected for the next commit. |
| Zone 3 — Repository | Permanent history. Every commit lives here. |
| `git diff` | Zone 1 vs Zone 3. What is not staged yet. |
| `git diff --staged` | Zone 2 vs Zone 3. What will be committed. |
| `+` in a diff | A line that was added |
| `-` in a diff | A line that was removed |
| `git show <hash>` | Full details of one specific commit |
| `HEAD` | Pointer to the current commit |
| `HEAD~1` | One commit before current |
| `git restore --staged` | Unstage a file — keep changes on disk |

---

## Up Next

**[LAB-03 — Branches](./GIT-LAB-03-Branches.md)**

You have been saving all your snapshots in a single straight line.
LAB-03 introduces branches — the ability to work on two different
versions of your project at the same time without them interfering
with each other. This is what makes Git powerful for real projects.
