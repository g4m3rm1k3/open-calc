---
series: git-version-control
level: 0
title: What Git Is
lang: bash
---

# What Git Is

Git is a version control system — it records every change made to a project. You can see who changed what, when, and why. You can return to any previous state. You can work on two different changes in parallel and merge them. For a developer working alone or on a team, Git is not optional.

## Why version control exists

```bash
# Without version control — what developers actually do wrong:
project/
  app.js
  app_old.js
  app_backup.js
  app_final.js
  app_final_v2.js
  app_ACTUALLY_FINAL.js

# With version control — one file, full history:
project/
  app.js     ← the only copy; every previous version is in git's history
```

```text
Git records a history of snapshots called commits.
Each commit is a complete picture of the project at one point in time.

Benefits:
1. Undo: return to any previous commit if you break something
2. History: see what changed, when, and (with good commit messages) why
3. Parallel work: branches let you work on two features simultaneously
4. Collaboration: multiple developers merge their changes
5. Safety net: experiment freely — you can always go back
```

## The three states of a file

Git tracks files through three states. Understanding this model is the key to understanding every Git command.

```bash
# 1. Working directory — files as they are on disk
#    (you just edited app.js — git doesn't know yet)

# 2. Staging area (Index) — changes you've selected for the next commit
git add app.js
#    (now app.js changes are staged — "I want to commit this")

# 3. Repository — committed history
git commit -m "Add login endpoint"
#    (now the changes are permanently recorded with a message)
```

```text
State diagram:
[Working directory] --git add--> [Staging area] --git commit--> [Repository]

The staging area lets you commit only part of your changes.
If you edited 5 files but only want to commit 2 of them:
  git add file1.js file2.js
  git commit -m "Fix the login bug"
  (file3, file4, file5 stay in the working directory, not committed)

This is why git add exists — it's not about "saving", it's about choosing.
```

**CS lens:** Git uses a **directed acyclic graph** (DAG) to store history. Each commit is a node pointing to its parent commit. A branch is just a pointer to a node. This makes branching and merging O(1) operations — creating a branch is just writing a pointer. Git stores file content as **content-addressable objects** — each file version is stored by the SHA-1 hash of its content. If two files have identical content, Git stores one copy.

## Installing and configuring Git

```bash
# Check if Git is installed:
git --version
# → git version 2.43.0

# Configure your identity (required before first commit):
git config --global user.name "Alice Smith"
git config --global user.email "alice@example.com"

# Set default editor for commit messages:
git config --global core.editor "code --wait"  # VSCode

# View your configuration:
git config --list
```

```text
--global means this config applies to all repos on your machine.
Without --global, config applies only to the current repo.

user.name and user.email appear in every commit.
In a team, this is how you see who made each change.
These don't have to match your GitHub account, but they typically should.
```

**SE lens:** Git is the foundation of professional software development. GitHub, GitLab, Bitbucket — all are Git hosting services. CI/CD pipelines trigger on Git events (push to main = deploy). Code review happens on Git branches (pull requests). Understanding Git is understanding how professional software teams work, regardless of the company or codebase.

**Common mistakes:**
- `git add .` without checking what's staged — use `git status` first to see what will be committed.
- Not configuring `user.name` and `user.email` — commits show "unknown" author, which is unprofessional and breaks blame tools.

**Debug tip:** `git status` is the first command to run when confused. It shows the state of every file: staged, modified, untracked. Run it constantly during development.

**Next:** The core workflow — init, add, commit, log, and diff.

## Challenge: git_three_states

Match each git command to its effect.

```javascript
const gitCommands = {
  'git add file.js':          '',  // moves file.js to ___
  'git commit -m "msg"':      '',  // moves staged changes to ___
  'git status':               '',  // shows files in ___ states
};
```

```test
gitCommands['git add file.js'] = 'staging area'
gitCommands['git commit -m "msg"'] = 'repository'
gitCommands['git status'] = 'all three'
assert gitCommands['git add file.js'] === 'staging area'
assert gitCommands['git commit -m "msg"'] === 'repository'
assert gitCommands['git status'] === 'all three'
```
