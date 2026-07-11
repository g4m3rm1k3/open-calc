---
series: git-version-control
level: 5
title: Rebase, Stash, and Fixing Mistakes
lang: bash
---

# Rebase, Stash, and Fixing Mistakes

Git's real power is in recovering from mistakes — amending commits, undoing changes, and keeping history clean. These commands are what separate a confident Git user from one who "copies the folder to be safe."

## git stash — temporarily save work

```bash
# You're mid-feature when you need to quickly fix something on main:
git stash           # save working directory changes to a temporary stack
git switch main
git pull
# fix the urgent bug, commit...
git switch feature/my-work
git stash pop       # restore your in-progress changes
```

```text
git stash push -m "WIP: halfway through auth refactor"  ← add a message
git stash list
# → stash@{0}: WIP: halfway through auth refactor
# → stash@{1}: WIP: add search parameter

git stash pop        ← apply most recent stash and remove from stack
git stash apply      ← apply most recent stash but KEEP it on the stack

Stashes survive branch switches, but not repo clones.
Use them for short interruptions — not as long-term storage.
```

## git rebase — clean linear history

```bash
# Your feature branch diverged from main while you were working:
# main:    A - B - C - D (new commits while you worked)
# feature: A - B - X - Y (your commits)

# After merge: A - B - C - D - Merge(X,Y)  ← messy, hard to read
# After rebase: A - B - C - D - X' - Y'     ← clean, linear

git switch feature/add-search
git rebase main          # replay your commits on top of latest main
# → Rebasing...
# → Successfully rebased and updated refs/heads/feature/add-search
```

```text
Rebase rewrites your commits to have new parents (the latest main commits).
The commit hashes change (they're recalculated with new parents).

Golden rule: NEVER rebase commits that have been pushed to a shared branch.
Rebase rewrites history. If others have pulled your commits,
their history diverges from yours after rebase — they need to force-pull.

Safe rebase: only rebase your LOCAL commits that aren't on the remote yet.
```

**CS lens:** Rebase performs a series of **cherry-picks** — it takes each commit on your branch, calculates its diff, and re-applies that diff on top of the new base commit. The result is semantically identical code but with new commit hashes and a different parent pointer. This is why rebased commits are "new" commits even if the code change is identical — the hash includes the parent hash.

## Fixing mistakes

```bash
# Amend the last commit (not yet pushed):
git commit --amend -m "Fix the commit message typo"
# or add forgotten files and update message:
git add forgotten-file.js
git commit --amend -m "feat: add search with correct migration"

# Undo the last commit but keep the changes staged:
git reset --soft HEAD~1

# Undo the last commit and unstage changes (keep the files):
git reset HEAD~1
# or: git reset --mixed HEAD~1

# Discard all uncommitted changes (DANGEROUS — cannot be undone):
git restore .

# Revert a commit that's already been pushed (creates an "undo" commit):
git revert a1b2c3d
# Creates a new commit that undoes the changes from a1b2c3d
# Safe for shared branches because it doesn't rewrite history
```

```text
Three levels of reset:
--soft:  moves HEAD, keeps staged changes staged
--mixed: moves HEAD, unstages changes (files unchanged) [default]
--hard:  moves HEAD, discards all changes (files reverted) [DANGEROUS]

git reset --hard HEAD — discard ALL uncommitted changes.
git reset --hard HEAD~1 — discard last commit AND all changes from it.

When in doubt, use git revert instead of git reset.
Revert is safe for shared branches. Reset is not.
```

## Interactive rebase — rewriting history

```bash
# Clean up the last 3 commits before pushing:
git rebase -i HEAD~3

# Opens an editor with:
# pick a1b2c3d feat: add search endpoint
# pick b2c3d4e WIP forgot to add test
# pick c3d4e5f fix typo in test

# Change to:
# pick a1b2c3d feat: add search endpoint
# squash b2c3d4e WIP forgot to add test
# squash c3d4e5f fix typo in test

# Saves as a single clean commit: "feat: add search endpoint"
```

```text
Interactive rebase commands:
pick   — keep the commit as-is
squash — combine with previous commit (merge commit messages)
fixup  — combine with previous commit (discard this commit message)
reword — keep the commit but edit the message
drop   — remove the commit entirely

Only use on commits not yet pushed to shared branches.
```

**SE lens:** Clean commit history is professional courtesy to your future self and teammates. When debugging a production issue, `git bisect` (binary search through commits to find which commit introduced a bug) works well when commits are small and atomic. `git blame` (shows which commit last touched each line) is useful when commits are well-described. "WIP" and "fix" commits make both tools useless.

**Common mistakes:**
- `git reset --hard` without realizing it's irreversible — there is no undo for a hard reset. If you've accidentally done this, `git reflog` may save you — it records where HEAD has been.
- Rebasing pushed commits — causes `rejected (non-fast-forward)` on the next push. Requires `--force-push`, which overwrites remote history. Never do this on shared branches.

**Debug tip:** `git reflog` records every position HEAD has been in the last 90 days. If you accidentally reset or lost commits: `git reflog` → find the commit hash → `git checkout <hash>` → recover the work.

**Next:** Git workflows — gitflow, trunk-based development, and how teams organize their branches.

## Challenge: git_reset

Choose the right reset type.

```javascript
// Match the scenario to the correct git reset command:
const scenarios = {
  // Undo last commit but keep changes staged for a different commit message:
  undoKeepStaged: '',
  // Undo last commit and unstage changes (keep the code):
  undoUnstage: '',
  // Throw away all uncommitted changes permanently:
  discardAll: '',
};
```

```test
assert scenarios.undoKeepStaged.includes('reset') && scenarios.undoKeepStaged.includes('--soft')
assert scenarios.undoUnstage.includes('reset') && (scenarios.undoUnstage.includes('--mixed') || (!scenarios.undoUnstage.includes('--soft') && !scenarios.undoUnstage.includes('--hard')))
assert scenarios.discardAll.includes('restore') || (scenarios.discardAll.includes('reset') && scenarios.discardAll.includes('--hard'))
```
