# Git Masterclass — LAB 03 — Branches

**Read [LAB-02](./GIT-LAB-02-Three-Zones.md) first.** That lab explained
the three zones and how to inspect changes precisely. This lab introduces
the concept that makes Git genuinely powerful for real projects.

**What this lab adds over LAB-02:**
- What a branch is and why you need one
- How to create and switch branches (`git branch`, `git switch`)
- How two branches diverge and stay independent
- How to merge a branch back in (`git merge`)
- What a merge conflict is and how to resolve it step by step

---

## What You Will Build

By the end of this lab you will have done this sequence for real:

```
main ─── A ─── B ─────────────── E  (merge commit)
                  \             /
feature ──────── C ─── D ──────
```

- **A, B** = commits on `main` before the branch
- **C, D** = commits on a `feature` branch (separate line of work)
- **E** = the merge commit that brings both lines together

You will also resolve a real merge conflict — two branches editing the
same line of a file — and understand exactly what happened and why.

---

## Concept: What a Branch Is

**What it is:** A branch is a lightweight, movable pointer to a commit.
Creating a branch does not copy any files. It creates a new label
that starts pointing at the current commit.

**The problem without branches:**

You are building a new feature. Halfway through, a bug report comes in
that must be fixed today. Your feature is half-done — broken, incomplete.
You cannot ship it. But you need to fix the bug in the working code.

Without branches, your only options are:
1. Hack out the half-done feature, fix the bug, then redo the feature — nightmare
2. Make a whole copy of the project folder — back to `_backup_final_v2`

**The solution:** Branches let you work on two things simultaneously
without them touching each other.

```
main branch     (the known-working code — always safe to use)
feature branch  (the new thing — half-done, broken, experimental — isolated)
```

When the feature is done and tested, you merge it back into `main`.
The bug fix also happens on its own branch, merged when done.
Neither ever interfered with the other.

**The key insight:** A branch is just a pointer. Creating one is instant.
Switching between them is instant. No files are copied.

**Why it matters here:** Branches are the core of every real Git workflow.
Everything in LAB-04 (remotes) and LAB-06 (team workflows) builds on this.

**Watch for:** "Branch" has two meanings people confuse:
1. The label/pointer (`main`, `feature/login`)
2. The entire line of commits that the label points to

Both usages are correct. In this lab, "branch" means the label unless
specified otherwise.

---

## Concept: `main` — The Default Branch

**What it is:** When you run `git init`, Git creates one branch
automatically: `main` (older repositories may call it `master`).
Every commit you have made so far has been on `main`.

`main` has no special powers — it is just the branch that exists
by default. By convention, `main` is treated as the stable, working
version of the project. New work goes on other branches and gets
merged into `main` when ready.

**Why it matters here:** You will create branches from `main` and
merge back into `main`. Knowing that `main` is just the starting branch
— not a special system — removes the mysticism around it.

**Watch for:** In older repositories and tutorials you will see
`master` instead of `main`. They are identical in behavior.
The rename was a convention change, not a technical change.

---

## Concept: `git branch`

**What it is:** A command with multiple uses depending on its arguments.

```bash
git branch                    # list all branches (current branch has * marker)
git branch feature-name       # create a new branch at the current commit
git branch -d feature-name    # delete a branch (safe — only if merged)
git branch -D feature-name    # force-delete a branch (even if not merged)
```

**Creating a branch does not switch to it.** You create the branch,
but you are still on your current branch. You need `git switch` to move.

**Example:**
```bash
git branch experiment
git branch
```
Output:
```
  experiment
* main
```
The `*` marks the branch you are currently on. You are still on `main`.
`experiment` exists but you are not on it yet.

**Why it matters here:** You will use `git branch` to create feature
branches and to verify which branch you are on.

**Watch for:** `git branch -d` refuses to delete an unmerged branch
(this protects you from losing work). Use `-D` only when you are
certain you want to throw away that branch's unique commits.

---

## Concept: `git switch`

**What it is:** The command that moves you from one branch to another.
When you switch, Git updates all the files on disk to match the state of
the branch you are switching to.

```bash
git switch branch-name             # switch to an existing branch
git switch -c new-branch-name      # create AND switch in one step (-c = create)
git switch -                       # switch back to the previous branch
```

**What happens to your files when you switch:**
Git updates Zone 1 (working directory) to match the state of the new branch.
If `feature` branch has different file contents than `main`, your files
on disk will change the moment you switch.

**The problem before:** The older command for this was `git checkout branch-name`.
`git checkout` does many things (switch branches, restore files, inspect commits)
and is confusing. `git switch` was introduced specifically for switching branches.

**Why it matters here:** You will use `git switch -c feature-name` to start
a new branch and `git switch main` to go back to `main`.

**Watch for:** Git will refuse to switch branches if you have unsaved
(uncommitted) changes that would be overwritten. Either commit your changes,
stash them (LAB-05), or discard them before switching.

---

## Step 1 — Create and Switch to a Feature Branch

Navigate to your `git-practice` folder:

```bash
cd git-practice
git status
git log --oneline
```

Confirm you are on `main` with a clean working tree.

Create a branch for a new "about" section:

```bash
git switch -c feature/about
```

Check your branches:

```bash
git branch
```

### SAVE AND TRY

You should see:

```
* feature/about
  main
```

The `*` is now on `feature/about`. You have switched to the new branch.

**In your terminal, type:**
```bash
git log --oneline
```
Expected: same commits as before. The new branch starts pointing at the
same commit `main` points to. No history has changed.

**Change something:** Run `git switch main`, then `git branch` again.
Expected: `*` moves back to `main`. Run `git switch feature/about`
to return to the feature branch.

---

## Concept: How Branches Diverge

**What it is:** Once you commit on a branch, that branch "moves forward"
while other branches stay where they were. This creates a divergence — two
branches now point to different commits.

**Visualized:**

Before any commits on the feature branch:
```
A ─── B
      ↑
      main
      ↑
      feature/about      ← both point to same commit B
```

After one commit on `feature/about`:
```
A ─── B ─── C
      ↑       ↑
      main   feature/about   ← diverged: main is at B, feature is at C
```

After switching back to `main` and committing there:
```
A ─── B ─── D            ← main moved to D
      \
        ─── C             ← feature/about is still at C
```

Now the two branches have diverged completely. `main` has `D` but not `C`.
`feature/about` has `C` but not `D`.

**Why it matters here:** This is the setup for merging. Merging takes
two diverged branches and brings them back together.

**Watch for:** When you switch back to `main` after committing on a feature
branch, your files on disk change — because `main` and `feature/about`
have different content. This is normal and correct.

---

## Step 2 — Make Commits on the Feature Branch

Confirm you are on `feature/about`:

```bash
git branch
```

Create a new file for the about section:

```bash
echo "# About This Project" > about.txt
echo "A Git practice project for learning version control." >> about.txt
```

Stage and commit:

```bash
git add about.txt
git commit -m "Add about page content"
```

Add one more line:

```bash
echo "Author: learning Git from first principles." >> about.txt
git add about.txt
git commit -m "Add author line to about"
```

### SAVE AND TRY

Run:
```bash
git log --oneline
```

Expected: the two new commits PLUS the commits from `main`:
```
f1e2d3c Add author line to about
e4b5a6d Add about page content
c7d8e9f Add status line to notes
b3f9a12 Add project description
a1c4e88 First commit: create notes file
```

Now switch to `main` and check:

```bash
git switch main
ls
git log --oneline
```

### SAVE AND TRY (continued)

After switching to `main`:

`ls` should show `notes.txt` only — **`about.txt` is not visible**
because it only exists on the `feature/about` branch.

`git log --oneline` should show only the three commits from before the branch:
```
c7d8e9f Add status line to notes
b3f9a12 Add project description
a1c4e88 First commit: create notes file
```

The feature branch commits are hidden because you are on `main`.

**In your terminal, type:**
```bash
git switch feature/about
ls
```
Expected: `about.txt` reappears. The file comes back because it exists
on this branch. Switch back to `main` when done:
```bash
git switch main
```

---

## Concept: `git merge`

**What it is:** The command that takes the commits from one branch and
integrates them into the current branch, creating a unified history.

**Syntax:**
```bash
git merge branch-to-merge-in
```

You run this while on the branch you want to RECEIVE the changes.
To merge `feature/about` into `main`, switch to `main` first, then merge.

**Two types of merges:**

**1. Fast-forward merge:**
If `main` has not moved since the branch was created, Git does not need
to create a new merge commit. It simply moves the `main` pointer forward
to the branch's latest commit.

```
Before:
A ─── B                ← main
      \
        ─── C ─── D   ← feature/about

After fast-forward merge:
A ─── B ─── C ─── D
                   ↑
                   main (and feature/about)
```

**2. True merge (merge commit):**
If `main` has moved since the branch was created, Git creates a new
merge commit (`E` below) that has two parents — one from each branch.
This preserves the full history of both lines of development.

```
Before:
A ─── B ─── X         ← main moved (X was committed after branching)
      \
        ─── C ─── D   ← feature/about

After true merge:
A ─── B ─── X ──── E  ← main (E is the merge commit)
      \            /
        ─── C ─── D
```

**Why it matters here:** For this step, we will get a fast-forward merge
because `main` has not moved. In Step 4 we will create a true merge.

**Watch for:** After a successful merge, the source branch still exists.
`git merge` does not delete the branch. Delete it manually with
`git branch -d feature/about` when you are done.

---

## Step 3 — Merge the Feature Branch into Main

You are on `main`. Merge in the feature branch:

```bash
git merge feature/about
```

### SAVE AND TRY

You should see:

```
Updating c7d8e9f..f1e2d3c
Fast-forward
 about.txt | 3 +++++++++++++
 1 file changed, 3 insertions(+)
 create mode 100644 about.txt
```

"Fast-forward" confirms that `main` simply moved its pointer forward.

Now run:
```bash
ls
git log --oneline
```

Expected:
- `ls` shows both `notes.txt` and `about.txt` — the feature is now in `main`
- `git log --oneline` shows all five commits in a single line

**In your terminal, type:**
```bash
cat about.txt
```
Expected: the three lines from the feature branch — now part of `main`.

Clean up the feature branch (it has been merged, it is safe to delete):
```bash
git branch -d feature/about
git branch
```
Expected: only `main` remains.

---

## Concept: Merge Conflicts

**What it is:** A merge conflict occurs when two branches have each made
changes to the **same part of the same file**. Git cannot automatically
decide which version is correct, so it stops and asks you to decide.

**The problem:**
```
main:           notes.txt line 1 = "Project status: ready"
feature branch: notes.txt line 1 = "Project status: in progress"
```

Both branches changed line 1. Git has no way to know which is right.
It marks the file with conflict markers and pauses the merge.

**What a conflicted file looks like:**
```
<<<<<<< HEAD
Project status: ready
=======
Project status: in progress
>>>>>>> feature/status-update
```

Breaking down the markers:
- `<<<<<<< HEAD` — start of YOUR version (the branch you merged INTO)
- `=======` — separator between the two versions
- `>>>>>>> feature/status-update` — end of the INCOMING version (branch you merged)

**How to resolve:**
1. Open the file
2. Decide what the correct content should be (keep one, keep both, rewrite)
3. Delete ALL the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
4. Save the file
5. `git add` the resolved file
6. `git commit` to finish the merge

**Why it matters here:** Conflicts are not errors — they are Git asking
for a human decision. Understanding the markers lets you resolve them
confidently instead of panicking.

**Watch for:** Do NOT leave conflict markers in the file. If you commit
a file that still has `<<<<<<<` in it, that text is now in your code.
Always search for the markers after resolving.

---

## Step 4 — Create and Resolve a Merge Conflict

This step creates a conflict deliberately so you see exactly how it works.

**Setup: make `main` move after branching.**

First, create a new branch:
```bash
git switch -c feature/status-update
```

Edit `notes.txt` on this branch — change the first line:
```bash
# Open notes.txt in your editor and change the FIRST LINE to:
# "This is my Git masterclass practice project — Phase 2."
# Then save.
```

Or using the terminal (this replaces just line 1):
```bash
# On Mac/Linux:
sed -i '' '1s/.*/This is my Git masterclass practice project — Phase 2./' notes.txt
```

Commit on the feature branch:
```bash
git add notes.txt
git commit -m "Update project name in notes"
```

**Now switch back to `main` and also change line 1:**

```bash
git switch main
```

Edit `notes.txt` again — change the first line to something DIFFERENT:
```bash
sed -i '' '1s/.*/This is my Git practice project — updated on main./' notes.txt
```

Commit on `main`:
```bash
git add notes.txt
git commit -m "Update project description on main"
```

**Both branches have now changed the same line. Merge to trigger the conflict:**

```bash
git merge feature/status-update
```

### SAVE AND TRY

You should see:

```
Auto-merging notes.txt
CONFLICT (content): Merge conflict in notes.txt
Automatic merge failed; fix conflicts and then commit the result.
```

Run:
```bash
git status
```

Expected:
```
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   notes.txt
```

"both modified" means both branches changed the same file and Git could not
auto-merge them.

---

## Step 5 — Resolve the Conflict

Open `notes.txt` in a text editor. You will see something like:

```
<<<<<<< HEAD
This is my Git practice project — updated on main.
=======
This is my Git masterclass practice project — Phase 2.
>>>>>>> feature/status-update
Goal: learn Git from first principles.
Status: learning the three zones.
```

**Decide what the correct content should be.** For this exercise,
keep the feature branch version (the incoming change). Delete all the
conflict markers and leave only:

```
This is my Git masterclass practice project — Phase 2.
Goal: learn Git from first principles.
Status: learning the three zones.
```

Save the file.

Now stage the resolved file and complete the merge:

```bash
git add notes.txt
git commit -m "Merge feature/status-update: use Phase 2 project name"
```

### SAVE AND TRY

Git will open an editor with a pre-filled merge commit message.
Save and close it (in most terminals, press `:wq` if using Vim,
or just close the editor window if using a GUI editor).

Then run:
```bash
git log --oneline
```

Expected: you see the merge commit at the top, and the history shows
the two diverged lines converging:
```
a9b8c7d Merge feature/status-update: use Phase 2 project name
e4f3g2h Update project description on main
d1e2f3g Update project name in notes
...
```

**In your terminal, type:**
```bash
cat notes.txt
```
Expected: the resolved version with the Phase 2 line and no conflict markers.

**Verify there are no remaining conflict markers:**
```bash
grep "<<<<<<" notes.txt
```
Expected: no output (no matches). If you see output, you left a conflict
marker in the file and need to remove it, re-stage, and re-commit.

Clean up:
```bash
git branch -d feature/status-update
```

---

## Mental Model: Branches as Timelines

Think of `main` as the official timeline of your project. Every branch
is an alternate timeline that splits off at a certain point. Merging
is bringing an alternate timeline back into the official one.

```
Official timeline (main):
═══════════════════════════════════════════════════════════╗
                                                           ║
Alternate timeline (feature branch):                      ║
                    ╔══════════════╗                       ║
                    ║ split off    ║ merged back ──────────╝
                    ╚══════════════╝
```

The alternate timeline did its own thing without affecting the official
timeline. When it was done, it merged back in.

This is why you never work directly on `main` in a real project.
`main` is the timeline that other people depend on. Feature branches
are your private workspaces.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Branch created | Run `git branch`. See the new branch listed. |
| Switched to new branch | Run `git branch`. `*` is on the feature branch. |
| Commits isolated to branch | Switch to `main`. Run `git log --oneline`. Feature commits not visible. |
| Files isolated to branch | Switch to `main`. Run `ls`. Feature files not visible. |
| Fast-forward merge | `git merge feature/about` output says "Fast-forward." |
| Conflict detected | `git merge` output says "CONFLICT" and "Automatic merge failed." |
| Conflict markers visible | `cat` the conflicted file. See `<<<<<<<`, `=======`, `>>>>>>>`. |
| Conflict resolved | Remove markers, save, `git add`, `git commit`. |
| No markers remaining | `grep "<<<<<<" notes.txt` returns no output. |
| Branch deleted | `git branch -d branch-name`. Run `git branch`. Branch gone. |

---

## Branch Commands — Quick Reference

```
GOAL                                    COMMAND
──────────────────────────────────────  ──────────────────────────────────
List all branches                       git branch
Create a branch (stay where you are)    git branch branch-name
Create and switch in one step           git switch -c branch-name
Switch to an existing branch            git switch branch-name
Switch back to previous branch          git switch -
Merge a branch into current branch      git merge branch-name
Delete a merged branch                  git branch -d branch-name
Force-delete an unmerged branch         git branch -D branch-name
Abort an in-progress merge              git merge --abort
```

---

## What You Learned

| Concept | What it means |
|---------|---------------|
| Branch | A movable pointer to a commit — not a copy of files |
| `main` | The default branch — treated as the stable version by convention |
| `git branch name` | Creates a new branch at the current commit |
| `git switch -c name` | Creates and switches to a new branch |
| `git switch name` | Moves to an existing branch, updating files on disk |
| Diverged branches | Two branches that have each moved forward from their split point |
| Fast-forward merge | Main was behind — pointer moves forward, no merge commit needed |
| True merge | Both branches moved — a merge commit is created with two parents |
| Merge conflict | Two branches changed the same part of the same file |
| Conflict markers | `<<<<<<<`, `=======`, `>>>>>>>` — Git's way of showing both versions |
| HEAD | Pointer to the current commit on the current branch |

---

## Up Next

**[LAB-04 — Remotes and GitHub](./GIT-LAB-04-Remotes.md)**

Your repository currently lives only on your machine. LAB-04 connects it
to GitHub — a remote server. This lets you back up your work, access it
from any machine, and share it with others. It also explains the
`push`, `pull`, and `fetch` commands and exactly what they do to your
three zones.
