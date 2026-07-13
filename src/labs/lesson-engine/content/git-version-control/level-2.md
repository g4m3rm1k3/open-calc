---
series: git-version-control
level: 2
title: Branches and Merging
lang: bash
---

# Branches and Merging

In Level 1 you committed to `main` directly. In a solo project with a clean history, that works. The moment you have a half-finished feature, a bug fix that needs to ship before the feature is done, or a second developer working on the same repo, committing to `main` directly creates problems — half-finished work blocks everything else.

**Branches** solve this. A branch is a pointer to a commit — a lightweight label that tracks a parallel line of work. Creating a branch costs nothing. Switching between them is instant. Merging brings the changes together.

By the end of this lesson you will be able to create and switch branches, understand what `HEAD` points to, merge branches and resolve conflicts, and use `git log --graph` to visualize branch history.

## Creating and switching branches

```bash
# Create a new branch:
git branch feature/add-auth

# Switch to it:
git checkout feature/add-auth
# or (modern syntax):
git switch feature/add-auth

# Create and switch in one step:
git checkout -b feature/add-auth
git switch -c feature/add-auth

# List all branches (* marks current):
git branch
# → * feature/add-auth
#     main
```

```text
Branches are cheap — just a pointer to a commit.
Creating 10 branches costs almost nothing.
Naming conventions used in production teams:
  feature/add-login        — new feature
  fix/null-pointer-crash   — bug fix
  chore/update-deps        — non-feature work
  release/v2.1.0           — release preparation
```

## Working on a branch

```bash
# On feature/add-auth branch — make some commits:
echo "const auth = require('./auth')" >> app.js
git add app.js
git commit -m "feat: wire auth middleware into Express app"

# More commits...
git commit -m "feat: add POST /auth/login endpoint"
git commit -m "test: add integration tests for auth routes"

# Meanwhile, main hasn't changed — branches are independent
git log --oneline --graph --all
# → * a4b5c6d (feature/add-auth) test: add integration tests for auth routes
# → * b3c4d5e feat: add POST /auth/login endpoint
# → * c2d3e4f feat: wire auth middleware into Express app
# → * d1e2f3g (main) Add database connection
# → * e0f1a2b Initial commit
```

```text
Each branch maintains its own commit history from the point it diverged.
Changes on feature/add-auth don't appear on main until you merge.
You can switch between branches at any time — git saves your working state.
Uncommitted changes must be committed or stashed before switching branches.
```

**CS lens:** A Git branch is a **pointer** — just a file in `.git/refs/heads/` containing a 40-character commit hash. Creating a branch is creating a file. Switching branches (checkout) changes HEAD to point at that file. The entire DAG (directed acyclic graph) is shared — branches are just different entry points into the same graph.

## Merging

```bash
# Switch to main, then merge the feature branch:
git switch main
git merge feature/add-auth

# If no conflicts: fast-forward or auto merge commit created
# → Merge made by the 'ort' strategy.
#   auth.js | 45 +++++++++++++++
#   1 file changed, 45 insertions(+)

# After merging, delete the feature branch (work is done):
git branch -d feature/add-auth
```

```text
Two merge strategies:
1. Fast-forward: main hasn't moved since the branch diverged.
   Git simply moves main's pointer to the branch tip.
   No merge commit created — history stays linear.

2. Recursive/Ort merge: both main and the branch have new commits.
   Git creates a merge commit with two parents.
   History shows the branch existed and was merged.

Prefer fast-forward for small features (use --rebase).
Merge commits are appropriate for significant features.
```

## Merge conflicts

```bash
# A conflict occurs when both branches changed the same lines:
git merge feature/update-port
# → CONFLICT (content): Merge conflict in config.js
# → Automatic merge failed; fix conflicts and then commit.

# The conflicted file contains conflict markers:
# <<<<<<< HEAD (your changes on main)
# const port = 3000;
# =======
# const port = process.env.PORT ?? 4000;
# >>>>>>> feature/update-port (incoming changes)

# Resolve by editing to the desired state:
# const port = process.env.PORT ?? 3000;

# Then stage and commit:
git add config.js
git commit -m "Merge feature/update-port: use env var with 3000 default"
```

```text
Conflict markers show:
<<<<<<< HEAD           — start of your changes
=======                — divider
>>>>>>> branch-name    — end of incoming changes

Resolution: delete the markers and write the correct code.
VSCode and GitHub Desktop show conflicts visually with buttons:
"Accept Current Change" / "Accept Incoming Change" / "Accept Both Changes"
```

**SE lens:** Conflicts arise when two developers edit the same lines. Frequent small commits and short-lived branches minimize conflicts — the longer a branch lives, the more it diverges from main, and the harder it is to merge. The professional pattern: create a branch, do the work, merge within 1-2 days. Long-running branches (weeks) are a code review and merge problem waiting to happen.

**Common mistakes:**
- Working directly on `main` — if something breaks, main is broken. Always use a branch.
- Resolving a conflict by accepting all incoming or all current without reading — this silently drops correct code from one side.

**Debug tip:** During a conflict, `git status` shows which files are conflicted. `git diff` shows the conflict markers. After resolving all conflicts (no more `<<<<<<<` markers), `git add` the files and `git commit`.

**Next:** Remote repositories — GitHub, push/pull, and pull requests.

## Challenge: branch_workflow

Answer questions about branching.

```challenge javascript
const answers = {
  // What command creates AND switches to a new branch called 'fix/login'?
  createAndSwitch: '',
  // What command merges 'feature/auth' into the current branch?
  merge: '',
  // What command deletes branch 'old-feature' after merging?
  deleteBranch: '',
};
```

```test
assert answers.createAndSwitch.includes('fix/login')
assert (answers.createAndSwitch.includes('checkout -b') || answers.createAndSwitch.includes('switch -c'))
assert answers.merge.includes('merge') && answers.merge.includes('feature/auth')
assert answers.deleteBranch.includes('branch') && answers.deleteBranch.includes('-d') && answers.deleteBranch.includes('old-feature')
```
