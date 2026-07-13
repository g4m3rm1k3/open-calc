---
series: git-advanced
level: 3
title: git cherry-pick — Surgical Commit Application
lang: bash
---

# git cherry-pick — Surgical Commit Application

Most Git workflows move entire branches. But sometimes you need to move one specific commit: a bug fix from a feature branch onto a release branch, a hotfix from main onto an older maintenance branch, or a single useful commit from a colleague's work-in-progress branch.

`git cherry-pick` applies the diff of a specific commit onto the current HEAD, creating a new commit with the same changes but a new hash and new parent. The name is accurate: you are reaching into a branch and picking exactly one fruit without taking the whole tree.

By the end of this lesson you will understand what cherry-pick does mechanically, be able to apply single and multiple commits across branches, handle cherry-pick conflicts, and know when cherry-pick is the right tool and when it is a sign of a workflow problem.

## What cherry-pick does

```text
Before cherry-pick:
main:    A - B - C - D (HEAD)
feature: A - B - X - Y - Z

You want commit Y (a bug fix) applied to main.

git switch main
git cherry-pick Y

After:
main:    A - B - C - D - Y' (HEAD)  ← Y' is a NEW commit (same diff, new hash)
feature: A - B - X - Y - Z          ← feature is unchanged

Y and Y' have identical diffs but different hashes because:
  - Y's parent is X; Y's parent is D
  - Parent hash is part of the commit hash calculation
```

```bash
# Apply a specific commit to current branch:
git cherry-pick a1b2c3d

# Apply a commit from another branch by reference:
git cherry-pick feature/hotfix     # applies the tip commit of that branch
git cherry-pick origin/main        # applies the tip of remote main

# Apply multiple commits:
git cherry-pick a1b2c3d b2c3d4e c3d4e5f   # applies in order left→right

# Apply a range of commits (exclusive..inclusive):
git cherry-pick a1b2c3d..b2c3d4e   # applies commits AFTER a1b2c3d up to b2c3d4e
# Note: a1b2c3d itself is NOT included (same syntax as git log)

# Apply a range (inclusive on both ends):
git cherry-pick a1b2c3d^..b2c3d4e  # a1b2c3d IS included (the ^ means "parent of")
```

## Handling conflicts and cherry-pick options

```bash
# If a conflict occurs during cherry-pick:
# Git pauses and marks conflicts in the files with <<<< ==== >>>>

# Resolve the conflict:
# 1. Edit the conflicted files
# 2. git add the resolved files
# 3. Continue:
git cherry-pick --continue

# Or abort entirely:
git cherry-pick --abort

# Skip the current problematic commit and continue with the rest:
git cherry-pick --skip

# Cherry-pick without immediately committing (stage only):
git cherry-pick --no-commit a1b2c3d
# Useful for: applying multiple commits and squashing them into one,
# or for inspecting and modifying the change before committing.
```

```bash
# Preserve author information (otherwise the cherry-picker is shown as author):
git cherry-pick -x a1b2c3d
# -x appends: "(cherry picked from commit a1b2c3d)" to the commit message
# Standard practice for cherry-picks between maintained branches.

# Maintain a record of who did the cherry-pick:
git cherry-pick --signoff a1b2c3d
# Appends: "Signed-off-by: Your Name <you@example.com>"
# Required by some open-source projects (including the Linux kernel).
```

## Real-world cherry-pick scenarios

```text
SCENARIO 1: hotfix on a release branch
  main: ... - Feature1 - Feature2 - Security-Fix - Feature3 (HEAD)
  v2.1: ... - v2.1.0-release

  You need Security-Fix on v2.1 without the features:
  git switch v2.1
  git cherry-pick <Security-Fix hash>
  git tag v2.1.1

SCENARIO 2: salvage one commit from an abandoned branch
  You abandoned feature/big-refactor but one utility function in it is useful.
  git log feature/big-refactor --oneline  ← find the commit
  git switch main
  git cherry-pick <commit hash>

SCENARIO 3: apply a teammate's WIP fix to test locally
  # Their branch: fix/auth-bug
  git fetch origin
  git cherry-pick origin/fix/auth-bug
  # Test it. If it works, you can merge or revert your cherry-pick.

SCENARIO 4: backport — applying a v3 fix to v2 and v1
  git switch v2-maintenance
  git cherry-pick <fix-hash>
  git switch v1-maintenance
  git cherry-pick <fix-hash>
```

```text
When NOT to use cherry-pick:

Cherry-pick is a symptom of a workflow problem when used frequently.
If you find yourself cherry-picking the same commits repeatedly:
  • You may need a shared utility library
  • Your branch strategy may be wrong (long-lived divergent branches)
  • You may benefit from git rebase --onto instead

Cherry-pick creates DUPLICATE commits (same diff, different hash).
If both branches are later merged, the change appears twice in history.
git log --cherry-pick or git log --cherry can detect these duplicates.

Prefer merge or rebase for bringing entire branches together.
Use cherry-pick for targeted, intentional single-commit moves.
```

**CS lens:** Cherry-pick is a **patch application** operation. A patch is the diff between two tree states — it says "at this path, delete these lines, add these lines." Cherry-pick extracts the patch from the specified commit and applies it to the current tree, creating a new commit. This is exactly what `git apply` does with a patch file, and what `patch(1)` (the Unix utility from 1985) does. The key insight: a commit is a snapshot, but cherry-pick treats it as a diff (snapshot minus its parent). The same technique underlies `git format-patch` and `git am`, which are used for email-based patch workflows (the Linux kernel's primary contribution mechanism).

**SE lens:** Cherry-pick is most professionally justified in two contexts: (1) long-term support branches where security fixes must be backported to older versions, and (2) urgent hotfixes that must reach production before an entire feature branch is ready to merge. Outside these cases, frequent cherry-picking is a red flag that the team's branching strategy needs rethinking. The right question when reaching for cherry-pick is: "why can't I just merge the whole branch?" If the answer is "because there are other commits I don't want," that is often a sign that commits were not atomic.

**Common mistakes:**
- Forgetting `-x` when cherry-picking across maintained branches — future developers cannot trace the duplicate commit back to its origin.
- Cherry-picking a merge commit without `-m` — `git cherry-pick <merge-commit>` fails because a merge has two parents and Git doesn't know which diff to apply. Use `git cherry-pick -m 1 <merge-commit>` to specify the mainline parent.
- Expecting cherry-picked duplicates to be ignored by later merges — they usually aren't. If a cherry-picked commit and its original are both in a merge, Git applies the change twice. Use `git log --cherry-pick` to detect this before merging.

**Debug tip:** After a cherry-pick, `git show HEAD` shows exactly what was applied. Compare it to `git show <original-hash>` — they should have identical diffs but different commit metadata. If they differ significantly, a conflict was resolved in a way that changed the semantics.

## Challenge: git_cherry_pick

Answer questions about cherry-pick.

```challenge javascript
const cherryPick = {
  // Command to apply commit a1b2c3d to the current branch AND record its origin:
  applyWithRecord: '',

  // You cherry-picked a commit but there's a conflict. What are the three options?
  conflictOptions: '',

  // Command to apply a range of commits from d1e2f3 through f3a4b5 (both inclusive):
  applyRange: '',

  // Why does cherry-picking create a new commit hash even if the diff is identical?
  newHash: '',

  // When is cherry-pick a sign of a workflow problem?
  workflowSmell: '',
};
```

```test
assert cherryPick.applyWithRecord.includes('cherry-pick') && cherryPick.applyWithRecord.includes('-x')
assert cherryPick.conflictOptions.toLowerCase().includes('continue') && (cherryPick.conflictOptions.toLowerCase().includes('abort') || cherryPick.conflictOptions.toLowerCase().includes('skip'))
assert cherryPick.applyRange.includes('cherry-pick') && cherryPick.applyRange.includes('^') && cherryPick.applyRange.includes('d1e2f3') && cherryPick.applyRange.includes('f3a4b5')
assert cherryPick.newHash.toLowerCase().includes('parent') || cherryPick.newHash.toLowerCase().includes('hash') || cherryPick.newHash.toLowerCase().includes('different')
assert cherryPick.workflowSmell.toLowerCase().includes('frequent') || cherryPick.workflowSmell.toLowerCase().includes('repeated') || cherryPick.workflowSmell.toLowerCase().includes('branch') || cherryPick.workflowSmell.toLowerCase().includes('often')
```
