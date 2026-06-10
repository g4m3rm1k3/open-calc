# Git Masterclass — LAB 06 — Team Workflows

**Read [LAB-05](./GIT-LAB-05-Fixing-Mistakes.md) first.** That lab covered
how to fix every type of mistake safely. This lab applies everything to
the workflow you will use when working with other people.

**What this lab adds over LAB-05:**
- The fork model — why it exists and how it protects the original project
- How to keep your fork in sync with the upstream repository
- The feature branch naming convention teams actually use
- How to open a pull request (PR) and why PRs exist
- What `git rebase` is and how it differs from `git merge`
- The `.gitignore` file — preventing private and generated files from
  being committed

---

## What You Will Build

By the end of this lab you will understand and be able to execute the
complete team workflow cycle:

```
1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a feature branch
4. Make commits on the feature branch
5. Push the feature branch to your fork
6. Open a Pull Request to the original repository
7. Sync your fork when the original moves ahead
8. Merge (or rebase) your feature branch onto the updated main
```

You will also create a `.gitignore` file that prevents common noise
files (`.DS_Store`, `node_modules`, build output) from ever entering
the repository.

---

## Concept: The Fork and Clone Model

**What it is:** A workflow designed for contributing to a project you do
not own. Forking creates your own copy of the repository on GitHub,
under your account. Cloning downloads that copy to your machine.

**The problem without forking:**
In an open source project (or any project where you are not the owner),
you do not have permission to push directly to the original repository.
If everyone could push directly, the project would be chaotic.

**The solution — the fork model:**
```
Original repository         Your fork (on GitHub)      Your machine
(you have no push access)   (you own this copy)        (local clone)

g4m3rm1k3/cadcam     →fork→  you/cadcam         →clone→  cadcam/
       ↑                          │
       └──────────── Pull Request─┘
       (maintainer reviews and accepts your changes)
```

1. **Fork** — makes a copy of the original under your GitHub account
2. **Clone** — downloads your fork to your machine
3. **Push** — you push to your fork (you own it)
4. **Pull Request** — you ask the original maintainer to review and accept
   your changes

**Why it matters here:** This is how all open source contribution works.
It is also how many companies structure internal projects — a core team
owns `main`, contributors work in forks or feature branches.

**Watch for:** In many companies, everyone works in the SAME repository
(no forks) but each person works on separate branches. The pull request
step still exists — you open a PR from your feature branch to `main`.

---

## Concept: `upstream` — The Original Repository

**What it is:** By convention, when you fork a project, you add two remotes:

- `origin` — your fork (where you have push access)
- `upstream` — the original repository (read-only for you)

`upstream` lets you fetch new changes from the original project into
your local copy, so you can keep your fork up to date.

**Example:**
```bash
git remote add upstream https://github.com/g4m3rm1k3/cadcam.git
git remote -v
```
Output:
```
origin    https://github.com/yourname/cadcam.git (fetch)
origin    https://github.com/yourname/cadcam.git (push)
upstream  https://github.com/g4m3rm1k3/cadcam.git (fetch)
upstream  https://github.com/g4m3rm1k3/cadcam.git (push)
```

**Why it matters here:** This is exactly the setup in your cadcam
repository — you saw `origin` (your fork) and `upstream` (the original)
in the git log you shared earlier. This is why `git pull` could fetch
from `upstream/main`.

**Watch for:** You can fetch from `upstream` but you cannot push to it
(unless the owner gives you access). `git push upstream main` would be
rejected.

---

## Concept: Feature Branch Naming Conventions

**What it is:** Teams adopt naming conventions for branches so the
repository history is readable and automated tools can filter branches
by type.

**Common convention — prefix with type:**

```
feature/user-authentication
feature/dark-mode-toggle
fix/login-button-crash
fix/tooltip-overflow
docs/update-api-reference
chore/upgrade-dependencies
refactor/simplify-auth-service
```

**What each prefix means:**
- `feature/` — new functionality
- `fix/` — bug fix
- `docs/` — documentation only change
- `chore/` — maintenance (upgrades, config, not user-facing)
- `refactor/` — restructuring without behavior change

**Why this matters in practice:**
- GitHub shows branch names in PR titles
- CI/CD pipelines often trigger differently for `fix/` vs `feature/`
- Searching `git branch | grep fix/` finds all bug fix branches
- Delete-after-merge becomes obvious: `feature/` branches are temporary

**Why it matters here:** Start using this convention now, even solo.
When you join a team, you will already have the habit.

**Watch for:** Branch names cannot have spaces. Use `-` or `/` as separators.
`feature/user authentication` is invalid. `feature/user-authentication` is correct.

---

## Step 1 — The Solo-Team Simulation

Since you are working alone, we will simulate the fork and PR workflow
using your existing `git-practice` repository on GitHub.

**Simulate the upstream:** Think of your `git-practice` GitHub repo as
the "original project." Create a fork by cloning it to a second location:

```bash
# Clone the repo to a DIFFERENT folder name to simulate a second contributor
git clone https://github.com/yourname/git-practice.git git-practice-collab
cd git-practice-collab
```

Check the remotes:
```bash
git remote -v
```

Expected:
```
origin  https://github.com/yourname/git-practice.git (fetch)
origin  https://github.com/yourname/git-practice.git (push)
```

This simulates a colleague who cloned the same repo.

---

## Step 2 — Create a Feature Branch and Make Changes

In the `git-practice-collab` folder (simulating a contributor's machine):

```bash
git switch -c feature/add-contributing-guide
```

Create a new file:

```bash
cat > CONTRIBUTING.md << 'EOF'
# Contributing Guide

## How to contribute

1. Create a feature branch from main
2. Make your changes with clear commit messages
3. Open a Pull Request describing what you changed and why
4. Wait for review before merging

## Branch naming

feature/short-description
fix/short-description
EOF
```

Stage and commit:

```bash
git add CONTRIBUTING.md
git commit -m "Add contributing guide"
```

Push the feature branch to origin:

```bash
git push -u origin feature/add-contributing-guide
```

### SAVE AND TRY

Go to GitHub (`https://github.com/yourname/git-practice`) and refresh.

You should see a banner: **"Your recently pushed branches: feature/add-contributing-guide"**
with a button **"Compare & pull request"**.

This is where a real PR would be opened. Click the button to see the
pull request interface — it shows exactly what changed.

For this exercise, you can open the PR on GitHub (or skip it since
you are the only contributor). The important step is that the feature
branch is on GitHub.

---

## Concept: What a Pull Request Is

**What it is:** A pull request (PR) is a GitHub feature (not a Git feature)
that lets you ask another person to review your changes before they are
merged into `main`. It is a conversation attached to a diff.

**What a PR contains:**
- Which branch you want to merge FROM
- Which branch you want to merge INTO (usually `main`)
- The complete diff of all changes
- A title and description (you write these)
- A comment thread for review feedback
- Approval/rejection controls for reviewers

**Why PRs exist:**
Without PRs, everyone pushes directly to `main`. No one reviews code
before it lands. Bugs ship. Architecture degrades. PRs enforce a review
step between "I wrote this" and "this is now the team's code."

**The PR lifecycle:**
```
1. Developer opens PR ("I want to merge feature/login into main")
2. Reviewer reads the diff and comments ("Line 42 — use const not let")
3. Developer makes fixes, pushes more commits to the branch
4. PR auto-updates with the new commits
5. Reviewer approves
6. PR is merged into main
7. Feature branch is deleted
```

**Why it matters here:** Even working solo, open PRs for yourself.
The review step — even if you are reviewing your own work — catches
mistakes that you miss when writing in flow.

**Watch for:** "Merging a PR" on GitHub's website runs `git merge`
behind the scenes. GitHub offers three merge options:
- **Merge commit** — standard merge (creates a merge commit)
- **Squash and merge** — combines all PR commits into one
- **Rebase and merge** — rewrites history (covered next)

---

## Concept: `git rebase`

**What it is:** An alternative to `git merge` for integrating changes
from one branch into another. Instead of creating a merge commit, rebase
MOVES your commits to start from the tip of the target branch, rewriting
their hashes.

**The problem with merge commits in a busy project:**
```
main: A ─── B ─── C ─── D ─── E ─── F  (merge commits)
             \           /     \   /
feature:      ─── X ───       ─── Y
```
Many parallel branches + many merge commits = tangled history that is
hard to read.

**What rebase does:**
```
Before rebase (feature started at commit B, main has moved to D):
main:    A ─── B ─── C ─── D
                \
feature:         ─── X ─── Y

After git rebase main (from the feature branch):
main:    A ─── B ─── C ─── D
                              \
feature:                       ─── X' ─── Y'
```

The feature branch commits (`X`, `Y`) are replayed on top of `D`.
They get new hashes (`X'`, `Y'`) because their parent changed.
The result is a clean, straight line — as if you had started the
feature branch from `D` instead of `B`.

**Merge vs Rebase:**

| | `git merge` | `git rebase` |
|--|-------------|--------------|
| Preserves history? | Yes — merge commit shows the branch | No — rewrites commits as if no branch existed |
| Linear history? | No | Yes |
| Safe after push? | Yes | **No** — rewrites hashes |
| Conflict count | One conflict point | Possibly one conflict per commit |
| When to use | Merging long-lived branches | Cleaning up a feature branch before PR |

**The golden rule of rebase:**
> Only rebase commits that have NOT been pushed to a shared branch.

Rebasing rewrites hashes. If others have pulled your commits and you
rebase them, their history diverges from yours — the same "divergent
branches" problem.

**Why it matters here:** Many teams use `git rebase` to keep feature
branches clean before merging. The PR diff looks cleaner without merge
commits in the middle. You will see `--rebase` options in `git pull`
for the same reason.

**Watch for:** If a rebase conflicts, Git pauses at each conflicting
commit. You resolve, run `git rebase --continue`, and it replays the
next commit. It is like resolving multiple merge conflicts one by one.
Run `git rebase --abort` at any point to cancel and return to the
pre-rebase state.

---

## Step 3 — Practice Rebase

Go back to your main `git-practice` folder (not the collab one):

```bash
cd ../git-practice
```

Create a feature branch:
```bash
git switch -c feature/rebase-demo
echo "Rebase demo line 1." >> notes.txt
git add notes.txt
git commit -m "Add rebase demo line 1"

echo "Rebase demo line 2." >> notes.txt
git add notes.txt
git commit -m "Add rebase demo line 2"
```

Now simulate `main` moving forward while you were on the branch:
```bash
git switch main
echo "Main moved forward." >> about.txt
git add about.txt
git commit -m "Update about while feature was in progress"
```

Check the divergence:
```bash
git log --oneline --graph --all
```

Expected — you can see the fork:
```
* a1b2c3d (HEAD -> main) Update about while feature was in progress
| * e4f5g6h (feature/rebase-demo) Add rebase demo line 2
| * h7i8j9k Add rebase demo line 1
|/
* ...previous commits...
```

Rebase the feature branch onto the updated main:
```bash
git switch feature/rebase-demo
git rebase main
```

### SAVE AND TRY

Expected output:
```
Successfully rebased and updated refs/heads/feature/rebase-demo.
```

Run:
```bash
git log --oneline --graph --all
```

Expected — straight line:
```
* n1o2p3q (HEAD -> feature/rebase-demo) Add rebase demo line 2
* m4l5k6j Add rebase demo line 1
* a1b2c3d (main) Update about while feature was in progress
* ...
```

The feature branch commits now appear AFTER the main commit — as if you
had started the feature after `main` moved. Clean, linear history.

Now merge it back (will be fast-forward because of the rebase):
```bash
git switch main
git merge feature/rebase-demo
git branch -d feature/rebase-demo
git log --oneline
```

Expected: perfectly linear history, no merge commit.

---

## Concept: `.gitignore`

**What it is:** A file named `.gitignore` in the root of your repository
that tells Git which files and folders to ignore — never track, never show
in `git status`, never add with `git add .`.

**The problem before:**
```
git status output:
  Untracked files:
    .DS_Store              ← Mac system file, should never be committed
    node_modules/          ← 50,000+ files, should never be committed
    build/                 ← generated output, should never be committed
    .env                   ← secret keys and passwords, MUST never be committed
```

Every `git status` is polluted. Every `git add .` risks committing secret keys.

**The solution:**

```
# .gitignore file
.DS_Store
node_modules/
build/
dist/
.env
*.log
```

Once in `.gitignore`, those files and patterns are invisible to Git.

**Pattern syntax:**
```
.DS_Store           # exact file name — anywhere in the repo
node_modules/       # a directory (trailing slash = directory only)
*.log               # all files ending in .log
build/**            # everything inside build/
!build/README.md    # exception: track this file even though build/ is ignored
```

**Why it matters here:** Every project needs a `.gitignore` before the
first commit. Adding it late is painful — you have to remove already-tracked
files from Git's memory with `git rm --cached`.

**Watch for:** `.gitignore` only ignores UNTRACKED files. If a file is
already committed and tracked, adding it to `.gitignore` does nothing.
To stop tracking an already-tracked file:
```bash
git rm --cached filename       # remove from tracking, keep on disk
git add .gitignore
git commit -m "Stop tracking filename"
```

---

## Step 4 — Create a `.gitignore` File

In your `git-practice` folder:

```bash
cat > .gitignore << 'EOF'
# macOS system files
.DS_Store
.DS_Store?
._*

# Editor directories
.vscode/
.idea/

# Node.js
node_modules/
npm-debug.log*

# Build output
build/
dist/

# Environment variables — NEVER COMMIT THESE
.env
.env.local
.env.*.local

# Logs
*.log
EOF
```

Stage and commit:

```bash
git add .gitignore
git commit -m "Add gitignore for common noise files"
```

### SAVE AND TRY

Create a file that should be ignored:
```bash
touch .env
git status
```

Expected: `.env` does NOT appear in `git status` at all. Git ignores it.

```bash
touch notes.log
git status
```
Expected: `notes.log` also does not appear. The `*.log` pattern catches it.

**In your terminal, type:**
```bash
git check-ignore -v .env
```
Expected:
```
.gitignore:15:.env    .env
```
This tells you exactly which line in `.gitignore` is ignoring the file.
Useful for debugging when a file you expect to be ignored still appears.

Clean up:
```bash
rm .env notes.log
```

---

## Step 5 — Sync Your Fork with Upstream

This step simulates the situation you actually faced with cadcam —
your fork fell behind the original and you needed to sync.

In your `git-practice-collab` folder (the simulated clone):

```bash
cd ../git-practice-collab
```

Check what the "upstream" has that you do not (in real life, you would
have added the `upstream` remote — here `origin` IS the shared repo):

```bash
git fetch origin
git log --oneline HEAD..origin/main
```

If the main `git-practice` repo has new commits, you will see them.
To sync:

```bash
git switch main
git merge origin/main     # or: git pull (= fetch + merge)
```

This is exactly what resolves the "divergent branches" situation you
encountered — `git fetch` to see what is there, then `git merge` to
bring it in.

---

## The Complete Team Workflow — Summary

This is the workflow you will use daily on a team:

```
1. SYNC: Start the day by syncing your main with upstream
   git switch main
   git fetch upstream
   git merge upstream/main
   git push origin main        ← keeps your fork in sync

2. BRANCH: Create a feature branch from synced main
   git switch -c feature/what-i-am-building

3. WORK: Make small, focused commits
   git add specific-files
   git commit -m "Verb: what this commit does"
   (repeat)

4. KEEP UP: While working, periodically rebase onto updated main
   git fetch upstream
   git rebase upstream/main

5. PUSH: Push your feature branch to your fork
   git push -u origin feature/what-i-am-building

6. PR: Open a Pull Request on GitHub
   - Write a clear description of what and why
   - Link to any relevant issues
   - Request reviewers

7. REVIEW: Respond to feedback
   - Make changes, commit them
   - Push to the same branch — PR updates automatically

8. MERGE: Once approved, merge on GitHub

9. CLEAN UP: Delete the feature branch
   git switch main
   git fetch upstream
   git merge upstream/main
   git branch -d feature/what-i-am-building
   git push origin --delete feature/what-i-am-building
```

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Fork model understood | Explain the difference between origin and upstream. |
| Feature branch naming | All branches use `feature/`, `fix/`, etc. prefix. |
| PR opened | Feature branch visible on GitHub with "Compare & pull request" button. |
| Rebase completed | `git log --oneline --graph` shows linear history after rebase. |
| `.gitignore` works | `touch .env && git status` — `.env` not shown. |
| `git check-ignore` works | `git check-ignore -v .env` shows the matching rule. |
| Sync workflow works | `git fetch upstream && git merge upstream/main` runs cleanly. |

---

## Git Workflow Commands — Complete Reference

```
GOAL                                    COMMAND
──────────────────────────────────────  ──────────────────────────────────
Sync with upstream                      git fetch upstream
                                        git merge upstream/main
Start feature branch                    git switch -c feature/name
See divergence graph                    git log --oneline --graph --all
Rebase onto updated main                git rebase main
Continue after rebase conflict          git rebase --continue
Abort a rebase                          git rebase --abort
Push feature branch to origin           git push -u origin feature/name
Delete local branch                     git branch -d feature/name
Delete remote branch                    git push origin --delete feature/name
Check what .gitignore is ignoring       git check-ignore -v filename
Stop tracking a committed file          git rm --cached filename
```

---

## What You Learned

| Concept | What it means |
|---------|---------------|
| Fork | A copy of a repository under your GitHub account |
| Clone | Downloads a remote repository to your machine |
| `upstream` | The original repository your fork was copied from |
| `origin` | Your fork on GitHub — you have push access |
| Feature branch naming | `feature/`, `fix/`, `docs/` prefixes by convention |
| Pull Request | A request to merge your branch — triggers review |
| `git rebase` | Replays commits on top of a new base — linear history |
| Rebase vs Merge | Rebase = clean linear history. Merge = preserves branch structure. |
| `.gitignore` | Tells Git which files to never track |
| `git rm --cached` | Stops tracking a file already in the repository |
| Sync workflow | fetch upstream → merge → push origin → work on feature |

---

## You Are Done — What Comes Next

You now understand Git well enough to work effectively on your own projects
and to contribute to a team. Here is what to do with this knowledge:

**In your own projects:**
- Always create a feature branch for new work — never commit directly to `main`
- Write clear commit messages using a verb: "Add", "Fix", "Update", "Remove"
- Push regularly — your remote is your backup
- Use `git status` and `git log --oneline` constantly — know where you are

**When joining a team:**
- Ask: "What is your branch naming convention?"
- Ask: "Do you merge or rebase before PRs?"
- Ask: "Is force-push ever allowed?"
- Read the repository's `CONTRIBUTING.md` before opening your first PR

**Topics this series did not cover (advanced):**
- `git rebase -i` (interactive rebase — rewrite, squash, reorder commits)
- `git cherry-pick` (apply a single commit from another branch)
- `git bisect` (binary search through history to find which commit introduced a bug)
- `git reflog` (a safety net — shows every position HEAD has been at, even reset ones)
- Signed commits (GPG verification)
- GitHub Actions (automated CI/CD on push)

**The most important habit:** Commit early, commit often, write clear messages.
A commit you can read in six months is worth ten that just say "stuff."
