---
series: contributor-series
level: 1
title: Git Basics — Saving Your Work
lang: bash
---

# Git Basics — Saving Your Work

Without version control, "save" means one file with today's content. Yesterday's version is gone. If you make a mistake, you either notice immediately or lose the earlier state forever. Most people solve this by creating files named `lesson-v2-FINAL-final.md`. It doesn't scale.

Git solves this by tracking every change to every file, forever, with a message explaining why the change was made. Every lesson contribution goes through git — which means it's backed up, reviewable, and reversible. Before contributing, you need to understand the basics.

By the end of this lesson you will understand the three git states (working directory, staging area, repository), be able to use `git add`, `git commit`, and `git status` to save changes, and understand what a commit message should say and why it matters.

## The three states

```bash
# Every file in a git repo is in one of three states:
#
# Working Directory    Staging Area      Repository
#      (edit)         (git add)         (git commit)
#         │                │                 │
# Your files live here. You git add them here. git commit saves them here permanently.
#
# Check the current state of all files:
git status

# Example output after editing a file:
# On branch main
# Changes not staged for commit:
#   modified:   src/labs/lesson-engine/content/my-series/level-0.md
#
# Untracked files:
#   src/labs/lesson-engine/content/my-series/level-1.md
```

**CS lens:** Git stores your project as a **DAG** (Directed Acyclic Graph) of commits. Each commit is a snapshot of all tracked files at a point in time, plus a pointer to the previous commit (its parent). `git log` shows the commits as a linear list, but the underlying structure is a graph — multiple branches can share ancestors, and merges create commits with two parents. This graph structure is what makes branching and merging so powerful.

## Adding and committing

```bash
# Stage a file (move it to the staging area):
git add src/labs/lesson-engine/content/my-series/level-0.md

# Stage all changed files at once (use carefully):
git add .

# Commit the staged files (save them to the repository):
git commit -m "add: python-fundamentals level-0 — What Programming Is"

# Check the result:
git log --oneline
# → a1b2c3d add: python-fundamentals level-0 — What Programming Is
# → e4f5a6b Previous commit
```

## Writing good commit messages

```bash
# Good commit messages: short, specific, describe what changed
git commit -m "add: css-responsive level-3 — Responsive Typography"
git commit -m "fix: typo in python-fundamentals level-7 challenge test"
git commit -m "update: contributor-series level-0 — expand Markdown section"

# Bad commit messages:
git commit -m "stuff"          # what stuff?
git commit -m "wip"            # not useful to anyone else
git commit -m "fixed it"       # fixed what?
git commit -m "changes"        # changes to what?

# The test: if someone reads your commit message 6 months from now,
# do they know exactly what changed without looking at the code?
```

```text
Conventional commit prefixes (used in this project):
  add:     new content (new lesson, new series, new file)
  fix:     bug fix or correction
  update:  improvement to existing content
  chore:   non-content changes (config, scripts, etc.)

Format: <prefix>: <what changed> — <details if needed>
Example: add: sql-fundamentals level-5 — Subqueries and CTEs
```

**SE lens:** Commit messages are communication. In a solo project, they're messages to your future self. In a team project, they're messages to everyone who will ever work on the codebase. A well-written commit history lets you answer questions like "when did this change?" and "why was this added?" without reading code. `git log --oneline` should read like a changelog — a human-readable history of decisions.

**Common mistakes:**
- Committing too much at once — "add entire react series" in one commit means if there's a problem with level-3, it's buried with levels 0-7. One commit per level (or per small group of related changes) makes history easier to read and review easier for others.
- Using `git add .` carelessly — this stages everything including files you didn't mean to include. Check `git status` first to see exactly what will be staged.

**Debug tip:** `git diff` shows the exact changes in unstaged files. `git diff --staged` shows what's in the staging area about to be committed. Read these before every commit — they show you exactly what you're about to save.

**Next:** Branches and pull requests — how to submit your work for review.

## Challenge: git_workflow

Put the git workflow steps in the right order.

```challenge
const workflowSteps = [
  'git commit -m "add: my-series level-0"',
  'edit the file in your editor',
  'git add the-file.md',
  'git status to verify changes',
]

// What is the correct order of these steps? (use 0-based indices)
const correctOrder = [0, 1, 2, 3]   // fill this in
```

```test
// Correct order: edit → status → add → commit
assert correctOrder[0] === 1   // edit first
assert correctOrder[1] === 3   // then status
assert correctOrder[2] === 2   // then add
assert correctOrder[3] === 0   // then commit
```
