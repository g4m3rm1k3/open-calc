# Git Masterclass — LAB 05 — Fixing Mistakes

**Read [LAB-04](./GIT-LAB-04-Remotes.md) first.** That lab connected
your repository to GitHub. This lab gives you the confidence to experiment
freely by showing you exactly how to undo anything.

**What this lab adds over LAB-04:**
- Discarding changes in the working directory (`git restore`)
- Unstaging without losing changes (revisited with deeper context)
- Amending the last commit message or content (`git commit --amend`)
- Saving unfinished work temporarily (`git stash`)
- Undoing a commit safely with a new commit (`git revert`)
- Resetting to a past commit — the three modes (`git reset`)
- When to use each tool and which ones are safe to use on pushed commits

---

## What You Will Build

By the end of this lab you will know the right tool for every mistake:

```
MISTAKE                              TOOL
───────────────────────────────────  ─────────────────────────
Changed a file — want it back        git restore <file>
Staged a file by accident            git restore --staged <file>
Committed with wrong message         git commit --amend
Need to switch branches but          git stash / git stash pop
  have uncommitted changes
Committed a bug — want to undo it    git revert <hash>
Committed to wrong branch            git reset HEAD~1 (then move commit)
Need to go back 3 commits (local)    git reset --hard HEAD~3
```

The key distinction this lab teaches: **safe tools** (work on any commits,
including pushed ones) vs **rewrite tools** (only safe on commits that
have NOT been pushed).

---

## Concept: Safe vs Rewrite Operations

**What it is:** Some Git operations are safe to use at any time.
Others **rewrite history** — they change the commit hashes of commits
that already exist. Rewriting history that has been pushed causes serious
problems for collaborators.

**The rule:**
> If a commit has been pushed to a shared remote, do NOT rewrite it.
> Use safe operations instead.

| Operation | Rewrites history? | Safe after push? |
|-----------|-------------------|------------------|
| `git restore` | No | Yes |
| `git restore --staged` | No | Yes |
| `git commit --amend` | YES | **No** |
| `git stash` | No | Yes |
| `git revert` | No (adds a new commit) | **Yes** |
| `git reset --soft` | YES | **No** |
| `git reset --hard` | YES | **No** |

**Why it matters here:** You will use `git reset` and `git commit --amend`
regularly — but only before pushing. After pushing, use `git revert`.

**Watch for:** "Force push" (`git push --force`) can push rewritten history.
Never force push to a shared branch. It overwrites other people's work
with no warning.

---

## Concept: `git restore` — Discard Working Directory Changes

**What it is:** Discards the changes you have made to a file in the
working directory (Zone 1) and restores it to the version in the last
commit (Zone 3).

**Syntax:**
```bash
git restore filename.txt      # discard changes to one file
git restore .                 # discard ALL changes in working directory
```

**⚠ DESTRUCTIVE:** This is one of the few Git operations that destroys
work. Changes discarded by `git restore` are gone permanently — there
is no "undo" for this. Only use it when you are certain you do not want
the changes.

**The problem before:**
You edited `notes.txt` trying something experimental. It did not work.
You want the file back to its last committed state.

**The solution:**
```bash
git restore notes.txt
```

The file on disk is immediately overwritten with the last committed version.

**Why it matters here:** `git restore` is the "throw away this edit"
command. Pair it with `git diff` — check what you are about to lose
before running it.

**Watch for:** `git restore` is NOT the same as `git restore --staged`.
- `git restore filename` — discards Zone 1 changes (destructive)
- `git restore --staged filename` — moves from Zone 2 back to Zone 1 (safe)

The `--staged` flag completely changes the behavior.

---

## Step 1 — Discard a Working Directory Change

Navigate to `git-practice` and confirm a clean state:

```bash
cd git-practice
git status
```

Make an accidental change to `notes.txt`:

```bash
echo "Oops — this should not be here." >> notes.txt
cat notes.txt
```

Check the diff:
```bash
git diff notes.txt
```

Expected: the new line shows as a `+` addition.

Now discard it:

```bash
git restore notes.txt
```

### SAVE AND TRY

Run:
```bash
cat notes.txt
git diff
git status
```

Expected:
- `cat notes.txt` — the "Oops" line is gone
- `git diff` — no output (nothing changed)
- `git status` — "nothing to commit, working tree clean"

**The change is permanently gone.** There is no undo.

**In your terminal, type:**
```bash
git log --oneline
```
Expected: history unchanged. `git restore` does not create commits —
it just reverts the file on disk.

---

## Concept: `git commit --amend`

**What it is:** Modifies the most recent commit. It can change the commit
message, add forgotten files, or remove a file from the commit.

**Syntax:**
```bash
git commit --amend -m "New corrected message"     # fix message only
git commit --amend --no-edit                       # add staged files, keep message
```

**How it works:**
`--amend` does not add a new commit. It REPLACES the last commit with
a new one. The old commit disappears and a new commit (with a new hash)
takes its place.

**Example — fixing a typo in a commit message:**
```bash
git commit -m "Add abuot page"       # typo: "abuot"
git commit --amend -m "Add about page"   # fixed — replaces the previous commit
```

**Example — adding a forgotten file:**
```bash
git commit -m "Add login form"
# realize you forgot to include login.css
git add login.css
git commit --amend --no-edit    # login.css is now in the commit, message unchanged
```

**⚠ History rewrite:** `--amend` replaces the last commit with a new one.
The old commit's hash is gone. If you already pushed that commit, your
remote now has a different last commit than you do. Do not amend pushed commits.

**Why it matters here:** You will regularly commit and then notice a
typo in the message or a missed file. `--amend` fixes this cleanly
as long as the commit is not yet pushed.

**Watch for:** `--amend` only works on the LAST commit. To fix older
commits, you need `git rebase -i` (interactive rebase — an advanced topic
beyond this series).

---

## Step 2 — Amend the Last Commit

Make a small change and commit it with a typo:

```bash
echo "Amended line: added intentionally." >> about.txt
git add about.txt
git commit -m "Upadte about file"    # typo: "Upadte"
```

Check the log:
```bash
git log --oneline
```

Fix the message:
```bash
git commit --amend -m "Update about file"
```

### SAVE AND TRY

Run:
```bash
git log --oneline
```

Expected: the commit at the top now shows the corrected message.
The commit hash is also different — it is a new commit replacing the old one.

**In your terminal, type:**
```bash
git show HEAD
```
Expected: the corrected message in the commit details.

---

## Concept: `git stash`

**What it is:** Temporarily saves your uncommitted changes (Zone 1 and
Zone 2) to a separate stack, leaving your working directory clean.
You can then restore them later with `git stash pop`.

**Syntax:**
```bash
git stash                     # save changes to stash (clears working dir)
git stash list                # see all stashed saves
git stash pop                 # restore the most recent stash and remove it
git stash apply               # restore the most recent stash but KEEP it in the list
git stash drop                # delete the most recent stash
git stash clear               # delete all stashes
```

**The problem before:**
You are halfway through editing `notes.txt` when you realize you need
to switch to a different branch to fix a bug. Git will not let you switch
if you have unsaved changes that could be overwritten. You are not ready
to commit — the work is half-done.

**The solution:**
```bash
git stash           # saves half-done work, clears working directory
git switch main     # can now switch freely
# ... fix the bug, commit it ...
git switch feature/whatever
git stash pop       # restores your half-done work exactly as you left it
```

**Why it matters here:** `git stash` is the "put down my work for a moment"
command. It is safe — nothing is deleted. The stash is a stack you can
inspect, add to, and pop from.

**Watch for:** `git stash pop` can cause merge conflicts just like
`git merge` if the stash conflicts with changes made while it was stashed.
Resolve conflicts the same way: edit the markers, `git add`, `git commit`.

---

## Step 3 — Use Stash to Park Unfinished Work

Make a change to `notes.txt` without committing:

```bash
echo "Work in progress — do not commit yet." >> notes.txt
git status
```

Expected: `notes.txt` shows as modified (unstaged).

Try to switch branches (Git will warn you):

```bash
git switch -c temp-branch
```

Note: if the change is minor Git may let you switch (it depends on whether
the change conflicts with the target branch). To demonstrate stash clearly:

```bash
git switch main    # go back if it switched
```

Stash the work:

```bash
git stash
git status
```

### SAVE AND TRY

After `git stash`:

```bash
git status
```
Expected: "nothing to commit, working tree clean." The in-progress change
is gone from disk.

```bash
cat notes.txt
```
Expected: the "Work in progress" line is NOT there.

```bash
git stash list
```
Expected:
```
stash@{0}: WIP on main: a1b2c3d Update about file
```

Your stash is saved. Now restore it:

```bash
git stash pop
cat notes.txt
```
Expected: the "Work in progress" line is back.

Clean up — discard this temporary line:
```bash
git restore notes.txt
```

---

## Concept: `git revert`

**What it is:** Creates a NEW commit that undoes the changes introduced
by a specific past commit. The original commit stays in the history —
`git revert` does not rewrite anything. It adds a "counter-commit."

**Syntax:**
```bash
git revert <commit-hash>      # undo a specific commit
git revert HEAD               # undo the most recent commit
git revert HEAD --no-edit     # undo without opening the message editor
```

**The problem before:**
You committed a bug. It is already pushed to GitHub. Team members might
have already pulled it. You cannot rewrite history (that would break
their repositories). You need to undo the bad commit's changes while
keeping all other history intact.

**The solution:**
```bash
git revert a1b2c3d     # creates a new commit that undoes a1b2c3d
git push               # pushes the "undo commit" to GitHub
```

Everyone's history is intact. The fix is visible in the log as a revert commit.

**Before and after:**
```
Before:
A ─── B ─── C (buggy commit)

After git revert C:
A ─── B ─── C ─── C' (revert of C — undoes C's changes)
```

`C` is still in the history. `C'` adds the opposite changes.
Net result: the project state matches how it looked after `B`.

**Why it matters here:** This is the ONLY safe way to undo a pushed commit.
`git reset` cannot be used after push (on shared branches).

**Watch for:** `git revert` undoes exactly one commit's changes.
If that commit's changes depend on other commits, the revert may fail
with conflicts. Resolve them the same way as merge conflicts.

---

## Step 4 — Revert a Commit

Make a commit that simulates a mistake:

```bash
echo "BUG: this line should not be in the project." >> notes.txt
git add notes.txt
git commit -m "Add broken content to notes"
```

Check the log:
```bash
git log --oneline
```

Note the hash of the bad commit (top of the log). Now revert it:

```bash
git revert HEAD --no-edit
```

### SAVE AND TRY

Git creates a new commit automatically. Run:

```bash
git log --oneline
```

Expected: two new commits at the top — the bad commit AND the revert:
```
d4e5f6g Revert "Add broken content to notes"
c1b2a3d Add broken content to notes
...
```

Run:
```bash
cat notes.txt
```
Expected: the "BUG" line is gone. The revert undid it.

Both commits are still in the history — the bad one and its undo.
This is the audit trail: you can see what happened and when.

---

## Concept: `git reset` — The Three Modes

**What it is:** Moves the current branch pointer backwards to a past
commit. This effectively "un-commits" commits. There are three modes
that determine what happens to the changes from the undone commits.

**⚠ REWRITES HISTORY. Only use on commits that have NOT been pushed.**

**The three modes:**

**`--soft` — undo the commit, keep changes staged:**
```bash
git reset --soft HEAD~1
```
The last commit is removed. Its changes land in Zone 2 (staging area).
The files on disk are unchanged. You can immediately re-commit with
a different message or after making further edits.

Use when: you committed too early or with the wrong message and want
to re-do the commit.

**`--mixed` (the default) — undo the commit, keep changes unstaged:**
```bash
git reset HEAD~1       # same as git reset --mixed HEAD~1
```
The last commit is removed. Its changes land in Zone 1 (working directory),
not staged. The files on disk are unchanged but nothing is staged.

Use when: you want to undo the commit and re-think what to stage.

**`--hard` — undo the commit AND discard the changes:**
```bash
git reset --hard HEAD~1
```
The last commit is removed AND all the changes from that commit are
deleted from the working directory. The files on disk revert to how
they looked at `HEAD~1`.

**⚠ DESTRUCTIVE.** The discarded changes are gone. No undo.

Use when: you want to completely throw away the last commit and its changes.

**Visual comparison:**
```
                    After reset HEAD~1:
                    ───────────────────
Mode     Zone 1 (disk)    Zone 2 (staged)    Zone 3 (repo)
──────   ───────────────  ─────────────────  ──────────────
--soft   changes kept     changes staged     commit removed
--mixed  changes kept     nothing staged     commit removed
--hard   changes deleted  nothing staged     commit removed
```

**Why it matters here:** `--soft` and `--mixed` are common for cleaning
up local work before pushing. `--hard` is for throwing away experiments.

**Watch for:** `git reset --hard` is permanent. The changes from the
removed commits are destroyed. There is no "undo" once you run it.
Always run `git log` and `git diff` first to confirm what you are discarding.

---

## Step 5 — Use Reset to Un-Commit

Make a commit you want to un-do:

```bash
echo "Temporary test line." >> notes.txt
git add notes.txt
git commit -m "Add temp test line"
git log --oneline
```

**Scenario A: undo the commit but keep the change staged (`--soft`):**

```bash
git reset --soft HEAD~1
git status
```

Expected: `notes.txt` is listed under "Changes to be committed." The commit
is gone from the log, but the change is still staged, ready to re-commit.

Re-commit it with a better message:
```bash
git commit -m "Add notes test line"
```

**Scenario B: undo the commit AND discard the change (`--hard`):**

Make another test commit first:
```bash
echo "Another temp line." >> notes.txt
git add notes.txt
git commit -m "Add another temp line"
```

Now discard it entirely:
```bash
git reset --hard HEAD~1
```

### SAVE AND TRY

Run:
```bash
cat notes.txt
git log --oneline
git status
```

Expected:
- `cat notes.txt` — "Another temp line." is gone
- `git log --oneline` — the temp commit is gone from history
- `git status` — "nothing to commit, working tree clean"

**The change and the commit are both gone permanently.**

---

## The Decision Tree — Which Tool to Use

```
SITUATION                              TOOL
────────────────────────────────────   ────────────────────────────────────

"I changed a file and want it back"    git restore <file>
(uncommitted, not staged)

"I staged something by accident"       git restore --staged <file>

"I need to switch branches but I       git stash
have uncommitted work"

"I made a typo in my commit message"   git commit --amend
(NOT yet pushed)

"I forgot to add a file to my          git add <file>
last commit" (NOT yet pushed)          git commit --amend --no-edit

"I committed something I want          git reset --soft HEAD~1
to un-commit but keep the changes"     (then re-commit)
(NOT yet pushed)

"I want to throw away the last         git reset --hard HEAD~1
commit AND its changes"
(NOT yet pushed)

"I pushed a bad commit and want        git revert <hash>
to undo it safely"                     git push
(already pushed — safe for others)

"I need to go back multiple commits"   git reset HEAD~N
(NOT yet pushed)                       (where N = number of commits back)
```

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `git restore` discards changes | Edit a file, run `git restore`, verify the edit is gone. |
| `git restore --staged` unstages | Stage a file, run `git restore --staged`, confirm it is unstaged. |
| `git commit --amend` fixes message | Check `git log --oneline` — message is corrected. Hash changed. |
| `git stash` parks work | Confirm `git status` is clean after stash. |
| `git stash pop` restores | Confirm the change reappears after pop. |
| `git revert` creates undo commit | `git log --oneline` shows the bad commit AND the revert commit. |
| `git reset --soft` un-commits | Commit removed from log, changes in staging area. |
| `git reset --hard` destroys | Commit removed, file changes gone from disk. |

---

## What You Learned

| Concept | What it means |
|---------|---------------|
| `git restore <file>` | Discard working directory changes — destructive, no undo |
| `git restore --staged` | Move from staging back to working directory — safe |
| `git commit --amend` | Replace last commit with a new one — rewrites history |
| `git stash` | Park uncommitted changes temporarily — safe |
| `git stash pop` | Restore the most recently stashed changes |
| `git revert` | Add a new commit that undoes a past commit — safe after push |
| `git reset --soft` | Remove last commit, keep changes staged — rewrites history |
| `git reset --mixed` | Remove last commit, keep changes unstaged — rewrites history |
| `git reset --hard` | Remove last commit AND discard all changes — destructive |
| Safe operations | Do not rewrite history — safe on any commit, before or after push |
| Rewrite operations | Change commit hashes — ONLY use before pushing |

---

## Up Next

**[LAB-06 — Team Workflows](./GIT-LAB-06-Team-Workflows.md)**

Everything so far has been solo work. LAB-06 introduces the patterns
that real teams use: the fork and pull-request workflow, feature branch
naming conventions, how to sync your fork with the original repository,
and how `git rebase` differs from `git merge`.
These are the patterns you will use daily on a real team.
