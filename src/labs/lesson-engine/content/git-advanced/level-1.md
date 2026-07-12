---
series: git-advanced
level: 1
title: Reflog — Git's Safety Net
lang: bash
---

# Reflog — Git's Safety Net

Every experienced Git user has a moment where they think they've lost work permanently — an accidental `git reset --hard`, a deleted branch, a botched rebase. The developers who recover in two minutes are not lucky. They know about `git reflog`.

Reflog (the reference log) records every position HEAD has been in the last 90 days. It is local to your machine and completely separate from the object store's garbage collection. As long as you haven't waited 90 days and run `git gc`, every commit you've ever created is recoverable, regardless of what commands you ran afterward.

By the end of this lesson you will understand how reflog works and why it exists, be able to recover from `git reset --hard`, accidental branch deletion, and botched rebases, and know when work is genuinely unrecoverable (before you commit it).

## What reflog is and how to read it

```bash
git reflog
# or: git log -g

# Output:
# a1b2c3d HEAD@{0}: commit: feat: add payment service
# b2c3d4e HEAD@{1}: rebase finished: returning to refs/heads/feature/payments
# c3d4e5f HEAD@{2}: rebase: fix: validation logic
# d4e5f6a HEAD@{3}: rebase: feat: add payment model
# e5f6a7b HEAD@{4}: checkout: moving from main to feature/payments
# f6a7b8c HEAD@{5}: pull: Fast-forward
# a7b8c9d HEAD@{6}: commit: fix: remove debug log
```

```text
Reading reflog output:

HEAD@{0}    — where HEAD is right now
HEAD@{1}    — where HEAD was one operation ago
HEAD@{2}    — two operations ago
...

Each line = one time HEAD moved (commit, checkout, reset, rebase, merge, pull)

The hash on the left is the commit SHA that HEAD pointed to at that moment.
You can use HEAD@{N} anywhere you'd use a commit hash.

Reflog per branch (not just HEAD):
git reflog show main
git reflog show feature/payments
```

## Recovering from git reset --hard

```bash
# DISASTER: you ran git reset --hard HEAD~3 and lost 3 commits
git reset --hard HEAD~3   # ← the mistake

# RECOVERY:
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~3   ← this is where you are now
# b2c3d4e HEAD@{1}: commit: feat: add search   ← this is what you want
# c3d4e5f HEAD@{2}: commit: feat: add filter
# d4e5f6a HEAD@{3}: commit: feat: add sort

# Option 1: jump back to where you were
git reset --hard HEAD@{1}   # or use the hash: git reset --hard b2c3d4e

# Option 2: create a new branch at the lost point
git branch recovery/my-lost-work b2c3d4e
git switch recovery/my-lost-work
```

```text
Why this works:
  git reset --hard moves the branch ref and HEAD — it doesn't delete objects.
  The commits still exist in .git/objects/.
  Reflog shows that HEAD@{1} pointed to b2c3d4e before the reset.
  Git only removes unreferenced objects when git gc runs (default: 90 days).

What can't be recovered:
  • Changes you NEVER committed — they're only in your working directory.
    Once you run git reset --hard or git checkout ., they're gone.
  • Objects older than 90 days with no refs pointing to them (after git gc).
  • Stashes you ran git stash drop on (also tracked in reflog — check first).
```

## Recovering a deleted branch

```bash
# DISASTER: you deleted a branch you needed
git branch -d feature/oauth   # or -D for force delete

# RECOVERY: find where the branch tip was
git reflog
# e5f6a7b HEAD@{4}: checkout: moving from feature/oauth to main
# The commit hash at HEAD@{4} was the last commit on feature/oauth

# Restore it:
git branch feature/oauth e5f6a7b
# or: git checkout -b feature/oauth e5f6a7b

# Alternative: search all recent commits for the one you need
git log --all --oneline --graph | head -20
# or: git fsck --lost-found
# (git fsck scans all objects and lists any with no ref pointing to them)
```

## Recovering from a bad rebase

```bash
# DISASTER: a rebase went wrong and your branch history is mangled
git switch feature/x
git rebase main   # conflicts everywhere, you accepted wrong changes

# RECOVERY: find where feature/x was before the rebase
git reflog show feature/x
# a1b2c3d feature/x@{0}: rebase finished: returning to refs/heads/feature/x
# b2c3d4e feature/x@{1}: rebase: fix: validation
# c3d4e5f feature/x@{2}: commit: feat: add validation   ← BEFORE rebase
# d4e5f6a feature/x@{3}: commit: feat: add model

# Reset to pre-rebase state
git reset --hard feature/x@{2}
# or: git reset --hard c3d4e5f

# OR: the ORIG_HEAD shortcut
# Git saves the pre-rebase HEAD in ORIG_HEAD automatically
git reset --hard ORIG_HEAD
```

```text
Git's automatic safety refs:
  ORIG_HEAD  — set before: merge, rebase, reset (the "previous HEAD")
  MERGE_HEAD — the commit being merged in (during an in-progress merge)
  REBASE_HEAD — the current commit being applied (during in-progress rebase)
  CHERRY_PICK_HEAD — the commit being cherry-picked
  FETCH_HEAD — the tip of the last-fetched branch

These are files in .git/ that Git manages automatically.
They are your first recovery option before reaching for reflog.
```

**CS lens:** Reflog is an **append-only log** of HEAD state transitions — the same data structure used in database write-ahead logs (WAL), event sourcing systems, and the Kafka message queue. An append-only log is trivially recoverable to any past state because no information is discarded. The only difference from a database WAL is that reflog has a TTL (default 90 days for reachable refs, 30 days for unreachable) after which entries are eligible for garbage collection. The combination of content-addressing (objects never modified) and append-only reflog makes Git a time machine for code.

**SE lens:** Professional Git workflows are designed knowing that reflog exists. The advice "commit early and often, even WIP commits" is partly motivated by this: anything in a commit can be recovered from reflog. Anything only in the working directory cannot. The difference between a 10-minute recovery and permanent data loss is whether the work was committed at least once. This is also why CI systems run on pushed branches rather than local branches — local branches are protected by your reflog, but a hardware failure takes everything local with it.

**Common mistakes:**
- Running `git clean -fd` or `git checkout .` on untracked/uncommitted changes — these bypass reflog entirely. Untracked files are not Git objects and have no history.
- Confusing `git reflog` (local HEAD history) with `git log` (commit graph history). Reflog shows operations; log shows commits.
- Not checking `ORIG_HEAD` first before digging into reflog — Git sets it automatically before any destructive operation.

**Debug tip:** `git fsck --lost-found` scans the entire object database for objects that have no refs pointing to them ("dangling" objects). It writes them to `.git/lost-found/`. Useful when you can't find the hash in reflog but you know you committed the work.

## Challenge: git_reflog

Answer questions about recovery with reflog.

```challenge
const recovery = {
  // You ran git reset --hard HEAD~5 by mistake. What's your first command to recover?
  firstCommand: '',

  // What are the TWO conditions under which a commit becomes permanently unrecoverable?
  unrecoverable: '',

  // What does ORIG_HEAD contain after you run git rebase main?
  origHead: '',

  // A colleague deleted a branch on their machine. Can you recover it from reflog?
  remoteRecovery: '',

  // What is the maximum default age reflog keeps entries for?
  reflogAge: '',
};
```

```test
assert recovery.firstCommand.includes('reflog') || recovery.firstCommand.includes('ORIG_HEAD') || recovery.firstCommand.includes('reset --hard')
assert recovery.unrecoverable.toLowerCase().includes('commit') || recovery.unrecoverable.toLowerCase().includes('gc') || recovery.unrecoverable.toLowerCase().includes('90') || recovery.unrecoverable.toLowerCase().includes('working')
assert recovery.origHead.toLowerCase().includes('before') || recovery.origHead.toLowerCase().includes('previous') || recovery.origHead.toLowerCase().includes('pre-rebase') || recovery.origHead.toLowerCase().includes('was')
assert recovery.remoteRecovery.toLowerCase().includes('no') || recovery.remoteRecovery.toLowerCase().includes('local') || recovery.remoteRecovery.toLowerCase().includes('their machine') || recovery.remoteRecovery.toLowerCase().includes('only')
assert recovery.reflogAge.includes('90') || recovery.reflogAge.toLowerCase().includes('ninety') || recovery.reflogAge.toLowerCase().includes('day')
```
