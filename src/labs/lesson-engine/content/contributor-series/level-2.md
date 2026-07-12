---
series: contributor-series
level: 2
title: Branches and Pull Requests
lang: bash
---

# Branches and Pull Requests

If you commit directly to `main`, your half-finished work is immediately visible to everyone. If two contributors both edit `main` at the same time, their changes collide. In a project with multiple contributors, working directly on `main` is like editing a shared document in real time with no coordination — chaos.

Branches solve this: your work happens in isolation until it's ready. A pull request is then the formal proposal to merge your isolated work into `main`, with a built-in review step. This is the workflow used by every open-source project on GitHub.

By the end of this lesson you will know how to create a branch, commit to it, push it to GitHub, and open a pull request — the complete contribution workflow from start to finish.

## What a branch is

```bash
# A branch is like a personal copy of the codebase where you can
# make changes freely without affecting the original.

# See all branches:
git branch
# → * main          ← the star shows where you are

# Create a new branch and switch to it:
git switch -c lessons/add-react-fundamentals
# → Switched to a new branch 'lessons/add-react-fundamentals'

# Your branch starts as a copy of wherever you branched from (main).
# Now changes you make are only on THIS branch.
# main is untouched until you (or someone else) merges your branch.
```

```text
Why branch names matter:
  lessons/add-react-fundamentals  ← clear: adding React lessons
  fix/typo-python-level-3         ← clear: fixing a typo
  my-stuff                        ← unclear: what? for what?

Naming conventions in this project:
  lessons/  → new lesson content
  fix/      → corrections to existing content
  chore/    → config or script changes
```

**CS lens:** A branch is a **pointer** — a file in `.git/refs/heads/` containing a single commit hash. When you commit on a branch, the pointer moves to the new commit. When you switch branches (`git switch`), git changes your working files to match the commit the other branch points to. The entire codebase lives in one DAG; branches are just entry points into different parts of it.

## The contribution workflow

```bash
# Full workflow, start to finish:

# 1. Start from a clean main:
git switch main
git pull

# 2. Create your branch:
git switch -c lessons/add-react-fundamentals

# 3. Do your work:
#    Write lesson files, register in series.ts, etc.

# 4. Stage and commit as you go:
git add src/labs/lesson-engine/content/react-fundamentals/level-0.md
git commit -m "add: react-fundamentals level-0 — What React Is"
#    Repeat for each level.

# 5. Push your branch to GitHub (your fork):
git push -u origin lessons/add-react-fundamentals
# → Branch 'lessons/add-react-fundamentals' set up to track remote

# 6. Open a pull request on GitHub:
#    GitHub shows: "lessons/add-react-fundamentals had recent pushes → Compare & pull request"
#    Click it → fill in the PR title and description → Create pull request
```

## Writing a good pull request

```text
When you open a PR, you fill in a title and description.

Good PR title:
  "Add React Fundamentals series (8 levels)"

Bad PR title:
  "Lessons"
  "My contribution"
  "stuff"

Good PR description:
  ## What's in this PR
  - 8-level React Fundamentals series
  - Covers components, props, state, effects, hooks, context, and performance
  - All levels pass the lesson contract

  ## How to review
  1. Open the dev server: npm run dev
  2. Navigate to Labs → Learn to Code → React Fundamentals
  3. Click through each level and verify the challenges run

Bad PR description:
  (empty)
  "Added the lessons"
```

**SE lens:** A pull request is a **proposal** — you're proposing that your changes be merged. The description is your pitch. A good PR description answers: what did you add, why, and how should the reviewer verify it works? The reviewer is a human with limited time — the easier you make it to understand and verify your work, the faster your PR gets merged.

**Common mistakes:**
- Pushing directly to `main` — you can't do this on the main repo (branch protection prevents it), but you could on your fork. Don't. Keep `main` clean as a reference point.
- Opening a PR before the work is done — that's fine if you mark it as a Draft PR (GitHub has this option). It lets maintainers see work-in-progress without expecting it to be merge-ready.

**Debug tip:** After pushing your branch, run `git log --oneline origin/lessons/add-react-fundamentals` to verify the commits on the remote match what you expect. If something is missing, you may have forgotten to push.

**Next:** Reading code you didn't write — how to understand an unfamiliar codebase.

## Challenge: branch_workflow

Answer questions about branching and PRs.

```challenge
const answers = {
  // What command creates a branch called 'lessons/add-vue' and switches to it?
  createAndSwitch: '',
  // After finishing your work, what command sends your branch to GitHub?
  pushToRemote: '',
  // True or false: you open a pull request on GitHub, not in the terminal
  prOnGitHub: false,
  // What does a PR description help the reviewer understand?
  prDescriptionPurpose: '',
}
```

```test
assert (answers.createAndSwitch.includes('switch -c') || answers.createAndSwitch.includes('checkout -b')) && answers.createAndSwitch.includes('lessons/add-vue')
assert answers.pushToRemote.includes('push') && answers.pushToRemote.includes('origin')
assert answers.prOnGitHub === true
assert answers.prDescriptionPurpose.length > 15
```
