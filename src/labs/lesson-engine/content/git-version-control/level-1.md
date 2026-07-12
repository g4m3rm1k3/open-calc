---
series: git-version-control
level: 1
title: The Core Workflow
lang: bash
---

# The Core Workflow

In Level 0 you learned Git's three states — working directory, staging area, repository — and how files move between them. This lesson is about the commands that move them: the five you will use dozens of times every day.

`git init`, `git status`, `git add`, `git commit`, `git log`. This sequence is the heartbeat of Git development. Everything else — branches, remotes, rebasing — is built on top of these.

By the end of this lesson you will be able to initialise a repository, stage and commit changes, write commit messages that communicate intent, view history with `git log`, inspect changes with `git diff`, and configure `.gitignore` correctly.

## init, add, commit

```bash
# Create a new repo:
git init
# → Initialized empty Git repository in /path/to/project/.git/

# Create a file and check status:
echo "# My Project" > README.md
git status
# → On branch main
#   Untracked files:
#     README.md
#   nothing added to commit but untracked files present

# Stage the file:
git add README.md
git status
# → Changes to be committed:
#     new file: README.md

# Commit:
git commit -m "Initial commit: add README"
# → [main (root-commit) a1b2c3d] Initial commit: add README
#   1 file changed, 1 insertion(+)
#   create mode 100644 README.md
```

```text
git init creates a hidden .git/ directory in the project root.
That directory IS the repository — all history is stored there.
Deleting .git/ deletes all version history. Don't do that.

The commit hash (a1b2c3d) is the first 7 characters of a 40-character SHA-1.
Every commit has a unique hash — it's the commit's permanent ID.
```

## Writing good commit messages

```bash
# BAD — describes what, not why:
git commit -m "fix bug"
git commit -m "update"
git commit -m "changes"

# GOOD — explains why and what changed:
git commit -m "Fix login redirect after password reset"
git commit -m "Add rate limiting to POST /auth/login — prevent brute force"
git commit -m "Refactor CourseRepository to use parameterized queries"
```

```text
A commit message answers: "Why does this snapshot exist?"
Git records WHAT changed automatically (the diff).
The message records WHY — which is the information git can't infer.

Six months from now, "update" tells you nothing.
"Fix login redirect after password reset" tells you exactly
what problem was being solved and what changed to solve it.

Conventional Commits format (widely used in open source):
feat: add dark mode toggle
fix: correct off-by-one in pagination
docs: update API authentication guide
refactor: extract CourseRepository from route handlers
test: add integration tests for POST /courses
```

**CS lens:** The commit hash is a **cryptographic fingerprint** of the commit's content — parent hash, author, date, message, and file tree. Changing any byte in the history changes every subsequent hash. This makes Git history **tamper-evident** — you cannot silently modify a past commit without it being detectable (all subsequent hashes change).

## log and diff

```bash
# View commit history:
git log
# → commit a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
#   Author: Alice Smith <alice@example.com>
#   Date:   Fri Jul 11 2026
#
#       Initial commit: add README

# Compact format (one line per commit):
git log --oneline
# → a1b2c3d Initial commit: add README
# → e5f6a7b Add Express server
# → c9d0e1f Add database connection

# See what changed in a commit:
git show a1b2c3d

# See unstaged changes (working directory vs last commit):
git diff

# See staged changes (what will be committed):
git diff --staged
```

```text
git diff output:
-const port = 3000;           ← removed line (red in terminal)
+const port = process.env.PORT ?? 3000;  ← added line (green in terminal)

Lines starting with '-' were removed.
Lines starting with '+' were added.
Context lines (no +/-) show surrounding unchanged code.
```

## .gitignore — what not to track

```bash
# .gitignore — files and directories Git should ignore
node_modules/    # hundreds of thousands of files, reproducible with npm install
.env             # secrets — never commit
dist/            # build output — reproducible
*.log            # log files
.DS_Store        # macOS metadata
```

```text
Once a file is tracked, .gitignore won't untrack it.
To stop tracking a tracked file:
  git rm --cached .env
  echo ".env" >> .gitignore
  git commit -m "Remove .env from tracking"

GitHub provides standard .gitignore templates for Node.js, Python, etc.
When creating a repo on GitHub, select the appropriate template.
```

**SE lens:** The `.gitignore` file is as important as the code. `node_modules/` is never committed because it can be reconstructed from `package.json` with `npm install`. Committing it would add hundreds of thousands of files, slow every git operation to a crawl, and create noise in diffs. The same principle applies to build artifacts, cache directories, and anything generated from source.

**Common mistakes:**
- Committing `node_modules/` or `.env` — this is a significant mistake. `.env` in particular may contain secrets that are now in the repository's permanent history. Use `git filter-branch` or `git filter-repo` to purge them (complex process).
- Commit messages like `WIP` or `fix` — these communicate nothing. Write messages as if explaining to a colleague who needs to understand the change without reading the code.

**Debug tip:** `git log --oneline --graph --all` shows a visual ASCII graph of all branches and their relationship. Essential for understanding branching situations.

**Next:** Branches — creating parallel lines of work that can be merged.

## Challenge: commit_message

Write good commit messages.

```challenge
// For each bad commit message, write a better one:
const messages = {
  bad1: 'fix',
  bad2: 'update files',
  bad3: 'changes',
  // Write better versions:
  good1: '',  // context: fixed null pointer error when user email is missing
  good2: '',  // context: changed port from hardcoded 3000 to process.env.PORT
  good3: '',  // context: added input validation to POST /courses endpoint
};
```

```test
assert messages.good1.length > 10
assert messages.good2.length > 10
assert messages.good3.length > 10
assert !messages.good1.includes('fix') || messages.good1.length > 5
assert messages.good2 !== messages.bad2
assert messages.good3 !== messages.bad3
```
