---
series: git-version-control
level: 3
title: Remote Repositories and GitHub
lang: bash
---

# Remote Repositories and GitHub

A local Git repository lives entirely on your machine. That means no backup, no way for others to see your work, and no way to collaborate. A **remote** repository is a copy of the repo hosted on a server. `git push` sends your commits there; `git pull` fetches commits others have pushed.

GitHub is the largest host for public and private Git repositories. Understanding how remotes work — not just the commands, but what actually happens — is essential for working on any team.

By the end of this lesson you will be able to add a remote, push and pull branches, understand the difference between `fetch` and `pull`, and recover from common remote-related errors like "rejected — non-fast-forward."

## Adding a remote

```bash
# Create a repo on GitHub, then connect your local repo:
git remote add origin https://github.com/username/myapp.git
# 'origin' is the conventional name for the primary remote

# View remotes:
git remote -v
# → origin  https://github.com/username/myapp.git (fetch)
# → origin  https://github.com/username/myapp.git (push)

# Push your local main branch to the remote:
git push -u origin main
# -u sets 'origin main' as the tracking remote for this branch
# Subsequent pushes from this branch: just 'git push'
```

```text
HTTPS vs SSH for remotes:
  HTTPS: https://github.com/user/repo.git
    — prompts for username/password (or uses a credential manager)
    — works everywhere, easiest to set up
  SSH: git@github.com:user/repo.git
    — uses an SSH key pair for auth (no password prompts)
    — preferred for daily use once SSH keys are set up
    — set up: ssh-keygen -t ed25519 → add public key to GitHub Settings
```

## push, pull, fetch

```bash
# Push your commits to the remote:
git push
# → Enumerating objects: 5, done.
# → To https://github.com/username/myapp.git
#    a1b2c3d..e4f5a6b  main -> main

# Pull — fetch + merge (bring remote changes into your local branch):
git pull
# → From https://github.com/username/myapp.git
#    a1b2c3d..e4f5a6b  main -> origin/main
# → Updating a1b2c3d..e4f5a6b
# → Fast-forward

# Fetch — download remote changes WITHOUT merging:
git fetch origin
# Then inspect: git log origin/main
# Then merge when ready: git merge origin/main
```

```text
git pull = git fetch + git merge

Pull conflicts: if a colleague pushed to main and you also have commits
on main, git pull creates a merge commit. This clutters history.
Better workflow: always use branches for your work.
  1. git pull (sync main)
  2. git checkout -b feature/my-work
  3. Do work, commit
  4. git push origin feature/my-work
  5. Open a pull request on GitHub
```

**CS lens:** A remote is a **distributed replica** of the repository DAG. `git fetch` downloads new commits (nodes and edges) from the remote. `git push` uploads your local commits to the remote. Neither operation modifies working files — only the `.git/` directory is updated. `git merge origin/main` is the operation that actually updates your working files.

## Cloning a repository

```bash
# Clone creates a local copy of a remote repo:
git clone https://github.com/username/myapp.git
# Creates: myapp/ directory with the full repo history

# Clone into a specific directory name:
git clone https://github.com/username/myapp.git my-project
```

```text
Cloning does:
1. Creates the directory
2. Initializes a git repo
3. Adds the remote as 'origin'
4. Downloads all commits, branches, tags
5. Checks out the default branch (usually main)

After cloning:
  git remote -v  → shows origin pointing to the source URL
  git log        → shows the full commit history
  git branch -a  → shows all branches (local and remote-tracking)
```

**SE lens:** Every developer working on a team project clones the shared repository. From that point, each developer's workflow is: pull to sync, branch for work, push the branch, open a pull request. The PR (pull request) is where code review happens — team members read the diff, leave comments, request changes, then approve and merge. GitHub's pull request UI is the primary code review interface for most teams.

**Common mistakes:**
- Force-pushing to a shared branch (`git push --force`) — this rewrites history on the remote, deleting commits other developers have already pulled. Never force-push to `main` or any shared branch.
- Using `git pull` instead of `git fetch` + `git merge` separately — `git pull` is convenient but can create unexpected merge commits if your local branch has diverged. Understanding what each step does helps you resolve problems.

**Debug tip:** `git log --oneline origin/main` shows what's on the remote's main branch. Compare with `git log --oneline main` to see how much your local branch has diverged.

**Next:** Pull requests and code review — the collaborative workflow for merging changes.

## Challenge: remote_commands

Fill in the correct git commands.

```challenge
const commands = {
  // Push local 'feature/auth' branch to remote 'origin' for the first time:
  pushNewBranch: '',
  // Pull latest changes from origin main into current branch:
  pullMain: '',
  // Clone a repo from https://github.com/alice/myapp.git:
  clone: '',
};
```

```test
assert commands.pushNewBranch.includes('push') && commands.pushNewBranch.includes('origin') && commands.pushNewBranch.includes('feature/auth')
assert commands.pushNewBranch.includes('-u') || commands.pushNewBranch.includes('--set-upstream')
assert commands.pullMain.includes('pull') && (commands.pullMain.includes('origin') || commands.pullMain.includes('main'))
assert commands.clone.includes('clone') && commands.clone.includes('myapp')
assert commands.clone.includes('github') || commands.clone.includes('.git') || commands.clone.includes('https')
```
