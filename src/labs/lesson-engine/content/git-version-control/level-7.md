---
series: git-version-control
level: 7
title: Git Mastery Reference
lang: bash
---

# Git Mastery Reference

Seven levels in, you have every core Git concept. This level is your reference: the complete mental model in one place, the decision trees for every scenario you'll encounter, and the edge cases that trip up intermediate developers who learned the commands without understanding the underlying model.

The goal is not new syntax. It is to make sure you hold the whole system in your head — so that when something unexpected happens in a professional setting, you reason from principles rather than panic.

By the end of this lesson you will have a unified mental model of Git's object store and ref system, a decision framework for every common scenario (undo, collaborate, inspect, recover), and confidence that there is no Git situation you cannot think your way through.

## The complete mental model

Git stores everything in `.git/objects/` as four object types. Every operation is ultimately a manipulation of these objects and the refs that point into them.

```text
OBJECT TYPES (all content-addressed by SHA-1 hash):

blob     → a file's content at one point in time
            "the bytes of src/auth.ts at commit a1b2c3d"

tree     → a directory listing (names + hashes of blobs and sub-trees)
            "the src/ directory contains auth.ts (blob a1b2c3) and index.ts (blob b2c3d4)"

commit   → a snapshot: tree hash + parent hash(es) + author + message
            "at 2024-01-15, main pointed here; parent was a1b2c3d"

tag      → a named pointer to a commit (annotated tags include a message + signature)
            "v2.1.0 → commit c3d4e5f"

REFS (human-readable names for commit hashes):

.git/refs/heads/main        → current tip of main branch
.git/refs/heads/feature/x  → current tip of feature/x branch
.git/refs/remotes/origin/main → last-known state of origin's main
.git/HEAD                   → which branch is currently checked out
                              (or a bare hash if in "detached HEAD" state)
```

```text
WHAT EVERY COMMAND ACTUALLY DOES:

git add file.js
  → creates a blob object for file.js
  → updates .git/index (the staging area) to include that blob

git commit -m "msg"
  → creates a tree object from the current index
  → creates a commit object (tree + parent + author + msg)
  → moves the current branch ref forward to the new commit hash

git branch feature/x
  → creates .git/refs/heads/feature/x with the current commit hash
  → nothing else. Branches are just files.

git checkout feature/x
  → reads the tree at the tip of feature/x
  → overwrites your working directory with those file contents
  → writes "ref: refs/heads/feature/x" into .git/HEAD

git merge feature/x
  → finds the common ancestor of HEAD and feature/x
  → applies the two sets of changes on top of the ancestor
  → creates a merge commit with two parents

git rebase main
  → for each commit on your branch since it diverged from main:
      applies its diff on top of the current rebase position
      creates a NEW commit object with the same diff but new parent
  → moves your branch ref to the last new commit
```

**CS lens:** Git's object store is a **content-addressed persistent data structure** — the same design used in distributed hash tables, the Bitcoin blockchain, and IPFS. Content-addressing means two identical files always produce the same hash and are stored once (deduplication is free). The DAG of commits is immutable — you can only add nodes, never modify existing ones. "Rewriting history" (rebase, amend) actually creates new nodes and moves the branch pointer; the old nodes remain until garbage collected (`git gc`). This is why reflog can always recover "lost" commits.

## The decision framework

```text
SCENARIO: I made a mistake in my last commit (not yet pushed)
  ├─ Wrong commit message only         → git commit --amend -m "correct message"
  ├─ Forgot to include a file          → git add file.js && git commit --amend --no-edit
  ├─ Keep the changes but re-stage     → git reset --soft HEAD~1
  ├─ Keep changes, unstaged            → git reset HEAD~1  (--mixed)
  └─ Throw everything away             → git reset --hard HEAD~1

SCENARIO: I made a mistake in a commit that IS pushed (shared branch)
  └─ ALWAYS use git revert <hash>      → creates an "undo" commit, safe for others

SCENARIO: I need to find which commit introduced a bug
  └─ git bisect start → git bisect bad → git bisect good <old hash>
     Git binary-searches, you test each checkout, git bisect good/bad

SCENARIO: I need to apply one specific commit from another branch
  └─ git cherry-pick <hash>

SCENARIO: I need to interrupt my work and fix something else
  └─ git stash → switch → fix → commit → switch back → git stash pop

SCENARIO: I lost work (hard reset, branch deleted, bad merge)
  └─ git reflog → find the hash → git checkout <hash> → git branch recovery/x

SCENARIO: I want to inspect who wrote which lines
  └─ git blame <file>  — shows commit + author per line
     git log -S "search term" <file>  — finds commits that added/removed the term

SCENARIO: My branch has diverged from main
  ├─ Not yet pushed → git rebase main  (clean linear history)
  └─ Already pushed → git merge main   (safe, preserves your history)
```

```text
DAILY PROFESSIONAL WORKFLOW:

Start of day:
  git switch main && git pull   ← sync local main with remote

Starting new work:
  git switch -c feature/description-of-work

During work (commit early, commit often):
  git add -p           ← stage in hunks (not whole files) for clean commits
  git commit -m "type: what and why"

Before opening a pull request:
  git rebase main      ← place your commits on top of latest main
  git push -u origin feature/description-of-work

After PR is merged:
  git switch main && git pull
  git branch -d feature/description-of-work  ← clean up local branch
```

**SE lens:** The one thing experienced Git users have that beginners don't is: they never panic. Every "disaster" in Git (lost commits, broken merge, deleted branch) has a recovery path. Knowing that `git reflog` records the last 90 days of HEAD positions, and that no Git operation actually deletes objects immediately, removes all the fear. The second thing: they commit in small, atomic units. Not because Git requires it, but because `git bisect`, `git blame`, and `git revert` all work dramatically better when each commit does exactly one thing with a clear message.

**Common mistakes:**
- `git push --force` on a shared branch — overwrites teammates' work. Use `git push --force-with-lease` instead; it fails if the remote has commits you don't have locally, preventing accidental overwrites.
- Committing with `git add .` — stages everything including debug prints, `.env` files, and generated files that should be in `.gitignore`. Use `git add -p` (interactive hunk staging) for precision.
- Confusing `git revert` and `git reset` — `revert` is safe for shared branches (creates a new commit), `reset` rewrites history (unsafe if pushed).

**Debug tip:** When in doubt about what any Git command will do, use `--dry-run` where supported (`git push --dry-run`, `git clean -n`). For merges and rebases, `git diff main...HEAD` shows the exact changes that will be applied before you run the operation.

## Challenge: git_mastery

Answer the following Git scenarios with the exact command or concept.

```challenge
const mastery = {
  // You pushed a bad commit to a shared branch. How do you undo it safely?
  undoPushedCommit: '',

  // You accidentally ran git reset --hard and lost 2 commits. First step to recover:
  recoverAfterHardReset: '',

  // You want to bring your feature branch up to date with main WITHOUT a merge commit:
  updateBranchNoMergeCommit: '',

  // Command to apply commit a1b2c3d from another branch onto your current branch:
  applySingleCommit: '',

  // You need to find which commit introduced the string "delete from users" in the codebase:
  findStringInHistory: '',

  // What does git push --force-with-lease do differently from git push --force?
  forcePushSafe: '',
};
```

```test
assert mastery.undoPushedCommit.includes('revert')
assert mastery.recoverAfterHardReset.toLowerCase().includes('reflog')
assert mastery.updateBranchNoMergeCommit.includes('rebase') && mastery.updateBranchNoMergeCommit.includes('main')
assert mastery.applySingleCommit.includes('cherry-pick') && mastery.applySingleCommit.includes('a1b2c3d')
assert mastery.findStringInHistory.includes('log') && mastery.findStringInHistory.includes('-S') && mastery.findStringInHistory.includes('delete from users')
assert mastery.forcePushSafe.toLowerCase().includes('lease') || mastery.forcePushSafe.toLowerCase().includes('remote') || mastery.forcePushSafe.toLowerCase().includes('overwrit')
```
